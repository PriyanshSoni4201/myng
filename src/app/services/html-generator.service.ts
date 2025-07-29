import { Injectable } from '@angular/core';
import { TemplateLibraryService } from './template-library.service';

@Injectable({
  providedIn: 'root',
})
export class HtmlGeneratorService {
  constructor(private templateLibrary: TemplateLibraryService) {}

  public generateHeaderHtml(headerData: any): string {
    const headerImage = headerData.headerImage || '';
    // The header is just the background image.
    return `<div style="width: 100%; height: 100%;"><img src="${headerImage}" style="width: 100%; height: 100%;"></div>`;
  }

  public generateFooterHtml(footerData: any): string {
    const footerImage = footerData.footerImage || '';

    // This creates the vertical layout for the footer with placeholders.
    // The page number text takes up roughly 1/3 of the height, and the image takes 2/3.
    return `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; font-family: sans-serif; font-size: 10px;">
        <div style="flex-shrink: 0; text-align: center; padding: 4px; border-bottom: 1px solid #ccc;">
          Page {{PAGE_NUMBER}} of {{TOTAL_PAGES}}
        </div>
        <div style="flex-grow: 1;">
          <img src="${footerImage}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      </div>
    `;
  }

  public generateBodyHtml(
    contentItems: any[],
    pageTitle: string,
    showTitleOnAllPages: boolean
  ): string {
    if (!Array.isArray(contentItems)) {
      return '';
    }

    // Prepend the page title to the body content if the flag is true.
    const titleHtml =
      showTitleOnAllPages && pageTitle
        ? `<div style="text-align: center; font-family: sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 15px;">${pageTitle}</div>`
        : '';

    const bodyHtml = contentItems
      .map((item) => this.templateLibrary.getSnippet(item))
      .join('');

    return titleHtml + bodyHtml;
  }
}
