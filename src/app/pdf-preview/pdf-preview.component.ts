import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
// THE FIX IS HERE: Ensure the import path is all lowercase to match the new filename.
import { HtmlGeneratorService } from '../services/html-generator.service';
import { PdfService } from '../services/pdf.service';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [CommonModule],
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

  private headerBase64: string = '';
  private footerBase64: string = '';

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
      this.headerBase64 = data.headerImage;
      this.footerBase64 = data.footerImage;
      const bodyContentHtml = this.htmlGenerator.generateBodyHtml(data.content);

      this.finalPaginatedHtml = this.constructPaginatedHtml(bodyContentHtml);
      this.safeHtmlForPreview = this.sanitizer.bypassSecurityTrustHtml(
        this.finalPaginatedHtml
      );

      this.finalServerHtml = this.buildFinalHtmlForServer(bodyContentHtml);

      console.log('--- FLAWLESS HTML FOR PREVIEW / JSPDF (Paginated Divs) ---');
      console.log(this.finalPaginatedHtml);
      console.log('--- FLAWLESS HTML FOR SERVER (Single Document) ---');
      console.log(this.finalServerHtml);

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
      .map((chunk) => {
        return this._buildPageDiv(chunk);
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

  private _buildPageDiv(contentChunk: string): string {
    const headerHtml = `<div class="header"><img src="${this.headerBase64}"></div>`;
    const footerHtml = `<div class="footer"><img src="${this.footerBase64}"></div>`;

    return `
      <div class="page-container">
        ${headerHtml}
        <div class="content-area">${contentChunk}</div>
        ${footerHtml}
      </div>
    `;
  }

  private buildFinalHtmlForServer(bodyContent: string): string {
    const headerHtml = `<div class="header"><img src="${this.headerBase64}"></div>`;
    const footerHtml = `<div class="footer"><img src="${this.footerBase64}"></div>`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; font-family: sans-serif; }
            .header, .footer { position: fixed; left: 0; right: 0; width: 100%; }
            .header { top: 0; height: ${this.HEADER_H_MM}mm; }
            .footer { bottom: 0; height: ${this.FOOTER_H_MM}mm; }
            .header img, .footer img { width: 100%; height: 100%; }
            main { padding: ${this.HEADER_H_MM}mm ${this.SIDE_MARGIN_MM}mm ${this.FOOTER_H_MM}mm ${this.SIDE_MARGIN_MM}mm; }
            div, table { page-break-inside: avoid; }
          </style>
        </head>
        <body>
          ${headerHtml}
          ${footerHtml}
          <main>${bodyContent}</main>
        </body>
      </html>
    `;
  }
}
