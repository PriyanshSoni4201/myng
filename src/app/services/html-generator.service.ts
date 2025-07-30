import { Injectable } from '@angular/core';
import { TemplateLibraryService } from './template-library.service';

interface PaperFormatDimensions {
  width: number; // in mm
  height: number; // in mm
}

const PAPER_FORMATS: Record<string, PaperFormatDimensions> = {
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  Tabloid: { width: 279.4, height: 431.8 },
  Ledger: { width: 431.8, height: 279.4 },
  A0: { width: 841, height: 1189 },
  A1: { width: 594, height: 841 },
  A2: { width: 420, height: 594 },
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  A6: { width: 105, height: 148 },
  // Add lowercase variants for flexibility
  letter: { width: 215.9, height: 279.4 },
  legal: { width: 215.9, height: 355.6 },
  a3: { width: 297, height: 420 },
  a4: { width: 210, height: 297 },
  a5: { width: 148, height: 210 },
};

@Injectable({
  providedIn: 'root',
})
export class HtmlGeneratorService {
  constructor(private templateLibrary: TemplateLibraryService) {}

  /**
   * The primary function to generate the complete, paginated HTML report.
   * This is the single source of truth for the preview, jsPDF, and server.
   * @param reportData The full JSON data for the report.
   * @param contentChunks The body HTML, pre-paginated into an array of strings.
   * @returns A single string containing the full HTML document.
   */
  public generatePaginatedReportHtml(
    reportData: any,
    contentChunks: string[]
  ): string {
    const paperFormatKey = reportData.paperFormat || 'a4';
    const dimensions = PAPER_FORMATS[paperFormatKey] || PAPER_FORMATS['a4'];

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
          reportData.showPageTitleOnAllPage,
          dimensions
        );
      })
      .join('');

    return this._wrapInRootDocument(pageDivs, dimensions, reportData);
  }

  public generateUnpaginatedBodyHtml(contentItems: any[]): string {
    if (!Array.isArray(contentItems)) {
      return '';
    }
    return contentItems
      .map((item) => this.templateLibrary.getSnippet(item))
      .join('');
  }

  private generateHeaderHtml(headerData: any): string {
    const headerImage = headerData.headerImage || '';
    return `<div style="width: 100%; height: 100%;"><img src="${headerImage}" style="width: 100%; height: 100%;"></div>`;
  }

  private generateFooterHtml(footerData: any): string {
    const footerImage = footerData.footerImage || '';
    return `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; font-family: sans-serif; font-size: 10px;">
        <div style="flex-shrink: 0; text-align: center; padding: 4px; border-bottom: 1px solid #ccc;">
          Page {{PAGE_NUMBER}} of {{TOTAL_PAGES}}
        </div>
        <div style="flex-grow: 1;">
          <img src="${footerImage}" style="width: 100%; height: 100%;">
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
    showTitleOnAllPages: boolean,
    dimensions: PaperFormatDimensions
  ): string {
    const finalFooterHtml = footerTemplate
      .replace('{{PAGE_NUMBER}}', pageNumber.toString())
      .replace('{{TOTAL_PAGES}}', totalPages.toString());

    const titleHtml =
      showTitleOnAllPages && pageTitle
        ? `<div style="text-align: center; font-family: sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 15px;">${pageTitle}</div>`
        : '';

    return `
      <div class="page-container" style="width: ${dimensions.width}mm; height: ${dimensions.height}mm;">
        <div class="page-header-content">${headerTemplate}</div>
        <div class="page-body-content">${titleHtml}${contentChunk}</div>
        <div class="page-footer-content">${finalFooterHtml}</div>
      </div>
    `;
  }

  private _wrapInRootDocument(
    pageHtml: string,
    dimensions: PaperFormatDimensions,
    reportData: any
  ): string {
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
                position: relative;
                background-color: white;
                overflow: hidden;
                page-break-after: always;
                box-sizing: border-box;
                margin: 24px auto;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border: 1px solid #ced4da;
            }
            .page-container:last-child { page-break-after: auto; }
            .page-header-content { position: absolute; top: 0; left: 0; right: 0; height: ${headerHeight}mm; overflow: hidden; }
            .page-body-content { position: absolute; top: ${headerHeight}mm; bottom: ${footerHeight}mm; left: ${sideMargin}mm; right: ${sideMargin}mm; overflow: hidden; }
            .page-footer-content { position: absolute; bottom: 0; left: 0; right: 0; height: ${footerHeight}mm; overflow: hidden; }
            
            /* --- CHANGE IS HERE --- */
            .page-header-content img, .page-footer-content img { 
                width: 100%; 
                height: 100%; 
                object-fit: fill; /* Changed from 'cover' to 'fill' */
            }

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
