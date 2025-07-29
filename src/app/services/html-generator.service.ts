import { Injectable } from '@angular/core';
import { TemplateLibraryService } from './template-library.service';

@Injectable({
  providedIn: 'root',
})
export class HtmlGeneratorService {
  constructor(private templateLibrary: TemplateLibraryService) {}

  public generateBodyHtml(contentItems: any[]): string {
    if (!Array.isArray(contentItems)) {
      return '';
    }
    return contentItems
      .map((item) => this.templateLibrary.getSnippet(item))
      .join('');
  }
}
