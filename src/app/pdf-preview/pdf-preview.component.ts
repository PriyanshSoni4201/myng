// src/app/pdf-preview/pdf-preview.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { HtmlGeneratorService } from '../services/html-generator.service';
import { PdfService } from '../services/pdf.service';
import { TemplateLibraryService } from '../services/template-library.service';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [CommonModule],
  providers: [TemplateLibraryService],
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
      this.headerTemplate = this.htmlGenerator.generateHeaderHtml(data.header);
      this.footerTemplate = this.htmlGenerator.generateFooterHtml(data.footer);

      const bodyContentHtml = this.htmlGenerator.generateBodyHtml(
        data.contentMaster.contentItems
      );

      this.finalPaginatedHtml = this.constructPaginatedHtml(
        bodyContentHtml,
        data.pageTitle,
        data.showPageTitleOnAllPage
      );
      this.safeHtmlForPreview = this.sanitizer.bypassSecurityTrustHtml(
        this.finalPaginatedHtml
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
    this.pdfService.generatePdfServerSide(
      this.buildFinalHtmlForServer(this.finalPaginatedHtml)
    );
  }

  private constructPaginatedHtml(
    bodyContentHtml: string,
    pageTitle: string,
    showTitleOnAllPages: boolean
  ): string {
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
        return this._buildPageDiv(
          chunk,
          index + 1,
          contentChunks.length,
          pageTitle,
          showTitleOnAllPages
        );
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
    totalPages: number,
    pageTitle: string,
    showTitleOnAllPages: boolean
  ): string {
    const finalFooterHtml = this.footerTemplate
      .replace('{{PAGE_NUMBER}}', pageNumber.toString())
      .replace('{{TOTAL_PAGES}}', totalPages.toString());

    const titleHtml =
      showTitleOnAllPages && pageTitle
        ? `<div style="text-align: center; font-family: sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 15px;">${pageTitle}</div>`
        : '';

    return `
      <div class="page-container">
        <div class="page-header-content">${this.headerTemplate}</div>
        <div class="page-body-content">${titleHtml}${contentChunk}</div>
        <div class="page-footer-content">${finalFooterHtml}</div>
      </div>
    `;
  }

  private buildFinalHtmlForServer(paginatedHtml: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; font-family: sans-serif; }

            .page-container {
                position: relative;
                width: ${this.PAGE_W_MM}mm;
                height: ${this.PAGE_H_MM}mm;
                background-color: white;
                overflow: hidden;
                page-break-after: always;
                box-sizing: border-box;
            }
            .page-container:last-child {
                page-break-after: auto;
            }

            .page-header-content {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: ${this.HEADER_H_MM}mm;
                overflow: hidden;
            }

            .page-body-content {
                position: absolute;
                top: ${this.HEADER_H_MM}mm;
                bottom: ${this.FOOTER_H_MM}mm;
                left: ${this.SIDE_MARGIN_MM}mm;
                right: ${this.SIDE_MARGIN_MM}mm;
                overflow: hidden;
            }

            .page-footer-content {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: ${this.FOOTER_H_MM}mm;
                overflow: hidden;
            }

            .page-header-content img,
            .page-footer-content img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
          </style>
        </head>
        <body>
          ${paginatedHtml}
        </body>
      </html>
    `;
  }
}
