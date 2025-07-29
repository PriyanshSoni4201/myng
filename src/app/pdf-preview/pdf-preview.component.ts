import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { HtmlGeneratorService } from '../services/html-generator.service';
import { PdfService } from '../services/pdf.service';
import { TemplateLibraryService } from '../services/template-library.service'; // We need this for the body content

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [CommonModule],
  providers: [TemplateLibraryService], // Provide the library service
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css'],
})
export class PdfPreviewComponent implements OnInit {
  private readonly PAGE_W_MM = 210;
  private readonly PAGE_H_MM = 297;
  private readonly HEADER_H_MM = 35;
  private readonly FOOTER_H_MM = 30;
  private readonly SIDE_MARGIN_MM = 10;
  private readonly PREVIEW_WIDTH_PX = 700;

  private headerTemplate: string = '';
  private footerTemplate: string = '';

  private finalPaginatedHtml: string = '';
  private finalServerHtml: string = '';

  public safeHtmlForPreview: SafeHtml = '';
  public isLoading = true;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private htmlGenerator: HtmlGeneratorService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.http.get<any>('assets/data/report.json').subscribe((data) => {
      // 1. Generate the header and footer TEMPLATES
      this.headerTemplate = this.htmlGenerator.generateHeaderHtml(data.header);
      this.footerTemplate = this.htmlGenerator.generateFooterHtml(data.footer);

      // 2. Generate the raw BODY content
      const bodyContentHtml = this.htmlGenerator.generateBodyHtml(
        data.contentMaster.contentItems,
        data.pageTitle,
        data.showPageTitleOnAllPage
      );

      // 3. Paginate the body and construct the final page divs
      this.finalPaginatedHtml = this.constructPaginatedHtml(bodyContentHtml);
      this.safeHtmlForPreview = this.sanitizer.bypassSecurityTrustHtml(
        this.finalPaginatedHtml
      );

      // 4. Build the separate HTML for the server
      this.finalServerHtml = this.buildFinalHtmlForServer(
        bodyContentHtml,
        data.pageTitle,
        data.showPageTitleOnAllPage
      );

      this.isLoading = false;
    });
  }

  public downloadWithJsPDF(): void {
    const pageElements = new DOMParser().parseFromString(
      this.finalPaginatedHtml,
      'text/html'
    ).body.children;
    const pageStrings = Array.from(pageElements).map((el) => el.outerHTML);
    this.pdfService.generatePdfClientSide(pageStrings, this.PREVIEW_WIDTH_PX);
  }

  public downloadWithServer(): void {
    this.pdfService.generatePdfServerSide(this.finalServerHtml);
  }

  private constructPaginatedHtml(bodyContentHtml: string): string {
    const pxPerMm = this.PREVIEW_WIDTH_PX / this.PAGE_W_MM;
    const contentW_px = (this.PAGE_W_MM - this.SIDE_MARGIN_MM * 2) * pxPerMm;
    const contentH_px =
      (this.PAGE_H_MM - this.HEADER_H_MM - this.FOOTER_H_MM) * pxPerMm;

    const contentChunks = this._paginateContent(
      bodyContentHtml,
      contentW_px,
      contentH_px
    );

    return contentChunks
      .map((chunk, index) => {
        return this._buildPageDiv(chunk, index + 1, contentChunks.length);
      })
      .join('');
  }

  private _paginateContent(
    html: string,
    widthPx: number,
    heightPx: number
  ): string[] {
    const chunks: string[] = [];
    const source = document.createElement('div');
    source.innerHTML = html;
    const measurementDiv = document.createElement('div');
    measurementDiv.style.width = `${widthPx}px`;
    measurementDiv.style.visibility = 'hidden';
    measurementDiv.style.position = 'absolute';
    measurementDiv.style.top = '-9999px';
    document.body.appendChild(measurementDiv);
    let currentPageNodes: Node[] = [];

    Array.from(source.children).forEach((element: Element) => {
      measurementDiv.innerHTML = '';
      currentPageNodes.forEach((n) =>
        measurementDiv.appendChild(n.cloneNode(true))
      );
      measurementDiv.appendChild(element.cloneNode(true));
      if (
        measurementDiv.offsetHeight > heightPx &&
        currentPageNodes.length > 0
      ) {
        const chunkContainer = document.createElement('div');
        currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
        chunks.push(chunkContainer.innerHTML);
        currentPageNodes = [element.cloneNode(true)];
      } else {
        currentPageNodes.push(element.cloneNode(true));
      }
    });
    if (currentPageNodes.length > 0) {
      const chunkContainer = document.createElement('div');
      currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
      chunks.push(chunkContainer.innerHTML);
    }
    document.body.removeChild(measurementDiv);
    return chunks;
  }

  private _buildPageDiv(
    contentChunk: string,
    pageNumber: number,
    totalPages: number
  ): string {
    // Perform the placeholder replacement at the very last step
    const finalFooterHtml = this.footerTemplate
      .replace('{{PAGE_NUMBER}}', pageNumber.toString())
      .replace('{{TOTAL_PAGES}}', totalPages.toString());

    return `
      <div class="page-container">
        <div class="header">${this.headerTemplate}</div>
        <div class="content-area">${contentChunk}</div>
        <div class="footer">${finalFooterHtml}</div>
      </div>
    `;
  }

  private buildFinalHtmlForServer(
    bodyContent: string,
    pageTitle: string,
    showTitle: boolean
  ): string {
    // This method also needs to be updated to handle the title logic correctly
    const finalBodyContent =
      showTitle && pageTitle
        ? `<div style="text-align: center; font-family: sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 15px;">${pageTitle}</div>` +
          bodyContent
        : bodyContent;

    // For the server, we use CSS counters for page numbers
    const serverFooterHtml = this.footerTemplate.replace(
      'Page {{PAGE_NUMBER}} of {{TOTAL_PAGES}}',
      'Page <span class="pageNumber"></span> of <span class="totalPages"></span>'
    );

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; font-family: sans-serif; counter-reset: page; }
            .header, .footer { position: fixed; left: 0; right: 0; width: 100%; }
            .header { top: 0; height: ${this.HEADER_H_MM}mm; }
            .footer { bottom: 0; height: ${this.FOOTER_H_MM}mm; }
            .header img, .footer img { width: 100%; height: 100%; object-fit: cover; }
            main { padding: ${this.HEADER_H_MM}mm ${this.SIDE_MARGIN_MM}mm ${this.FOOTER_H_MM}mm ${this.SIDE_MARGIN_MM}mm; }
            div, table { page-break-inside: avoid; }
            .footer .pageNumber::before { content: counter(page); }
            .footer .totalPages::before { content: counter(pages); }
            .page-container { page-break-after: always; } /* This helps Puppeteer with breaks */
          </style>
        </head>
        <body>
          ${this.headerTemplate}
          ${serverFooterHtml}
          <main>${finalBodyContent}</main>
        </body>
      </html>
    `;
  }
}
