// src/app/services/html-generator.service.ts
import { Injectable } from '@angular/core';
import { TemplateLibraryService } from './template-library.service';

@Injectable({
  providedIn: 'root',
})
export class HtmlGeneratorService {
  constructor(private templateLibrary: TemplateLibraryService) {}

  public generateHeaderHtml(headerData: any): string {
    const headerImage = headerData.headerImage || '';
    return `<div style="width: 100%; height: 100%;"><img src="${headerImage}" style="width: 100%; height: 100%; object-fit: cover;"></div>`;
  }

  public generateFooterHtml(footerData: any): string {
    const footerImage = footerData.footerImage || '';

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

  public generateBodyHtml(contentItems: any[]): string {
    if (!Array.isArray(contentItems)) {
      return '';
    }

    const bodyHtml = contentItems
      .map((item) => this.templateLibrary.getSnippet(item))
      .join('');

    return bodyHtml;
  }
}
