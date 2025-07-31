import { Injectable } from '@angular/core';
import { TemplateLibraryService } from './template-library.service';

@Injectable({
  providedIn: 'root',
})
export class HtmlGeneratorService {
  constructor(private templateLibrary: TemplateLibraryService) {}

  public generateUnpaginatedBodyHtml(contentItems: any[]): string {
    if (!Array.isArray(contentItems)) {
      return '';
    }
    return contentItems
      .map((item) => this.templateLibrary.getSnippet(item))
      .join('');
  }

  public generatePaginatedReportHtml(
    reportData: any,
    contentChunks: string[]
  ): string {
    // Read header/footer data from the provided JSON structure
    const headerTemplate = this.generateHeaderHtml(reportData.header);
    const footerTemplate = this.generateFooterHtml(reportData.footer);

    const pageDivs = contentChunks
      .map((chunk, index) => {
        return this._buildPageDiv(
          headerTemplate,
          footerTemplate,
          chunk,
          index + 1,
          contentChunks.length,
          reportData.pageTitle,
          reportData.showPageTitleOnAllPage
        );
      })
      .join('');

    return this._wrapInRootDocument(pageDivs);
  }

  // Changed to accept the full header object and extract the URL
  private generateHeaderHtml(headerData: any): string {
    const headerImage = headerData.headerImage || '';
    // Use headerImage directly as src (assuming it's a URL now)
    return `<div class="header"><img src="${headerImage}"></div>`;
  }

  // Changed to accept the full footer object and extract the URL
  private generateFooterHtml(footerData: any): string {
    const footerImage = footerData.footerImage || '';
    // The footer template with image and dynamic page number
    return `
      <div class="footer">
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; font-family: sans-serif; font-size: 10px;">
          <div style="flex-shrink: 0; text-align: center; padding: 4px; border-bottom: 1px solid #ccc;">
            Page {{PAGE_NUMBER}} of {{TOTAL_PAGES}}
          </div>
          <div style="flex-grow: 1;">
            <img src="${footerImage}" style="width: 100%; height: 100%;">
          </div>
        </div>
      </div>
    `;
  }

  private _buildPageDiv(
    headerTemplate: string,
    footerTemplate: string,
    contentChunk: string,
    pageNumber: number,
    totalPages: number,
    pageTitle: string,
    showTitleOnAllPages: boolean
  ): string {
    const finalFooterHtml = footerTemplate
      .replace('{{PAGE_NUMBER}}', pageNumber.toString())
      .replace('{{TOTAL_PAGES}}', totalPages.toString());

    const titleHtml =
      showTitleOnAllPages && pageTitle
        ? `<div style="text-align: center; font-family: sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 15px;">${pageTitle}</div>`
        : '';

    return `
      <div class="page-container">
        ${headerTemplate}
        <div class="content-area">${titleHtml}${contentChunk}</div>
        ${finalFooterHtml}
      </div>
    `;
  }

  private _wrapInRootDocument(pageHtml: string): string {
    const headerHeight = 35;
    const footerHeight = 20;
    const sideMargin = 10;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; font-family: sans-serif; background-color: #f0f2f5; }
            .page-container {
                position: relative; width: 210mm; height: 297mm;
                background-color: white; overflow: hidden; page-break-after: always;
                box-sizing: border-box; margin: 24px auto;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border: 1px solid #ced4da;
            }
            .page-container:last-child { page-break-after: auto; }
            .header { position: absolute; top: 0; left: 0; right: 0; height: ${headerHeight}mm; }
            .content-area { position: absolute; top: ${headerHeight}mm; bottom: ${footerHeight}mm; left: ${sideMargin}mm; right: ${sideMargin}mm; overflow: hidden; }
            .footer { position: absolute; bottom: 0; left: 0; right: 0; height: ${footerHeight}mm; }
            .header img, .footer img { width: 100%; height: 100%; }
            @media print {
              body { background-color: #fff; }
              .page-container { margin: 0; box-shadow: none; border: none; }
            }
          </style>
        </head>
        <body>
          ${pageHtml}
        </body>
      </html>
    `;
  }
}
