import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemplateLibraryService {
  private templates: { [key: string]: string } = {
    header_title: `
      <div style="width: 100%; text-align: center; margin: 20px 0; font-family: sans-serif; font-weight: bold; font-size: 16px;">
        ${'TEXT'}
      </div>
    `,
  };

  constructor() {}

  public getSnippet(key: string, data: any): string {
    let template = this.templates[key];
    if (!template) {
      return `<div style="color: red;">Unknown component: ${key}</div>`;
    }

    for (const dataKey in data) {
      const placeholder = '${' + dataKey.toUpperCase() + '}';
      template = template.replace(new RegExp(placeholder, 'g'), data[dataKey]);
    }
    return template;
  }
}
