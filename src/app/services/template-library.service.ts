// src/app/services/template-library.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemplateLibraryService {
  constructor() {}

  public getSnippet(item: any): string {
    if (item.isHeaderComponent) {
      return this.buildPatientHeader(item);
    }

    return `<div style="color: #ccc; border: 1px dashed #ccc; padding: 10px; margin-top: 15px;">(Component type '${item.header}' not yet implemented)</div>`;
  }

  private buildPatientHeader(item: any): string {
    const headerTitle = item.header || '';
    const tableData = item.tableData || {};
    const entries = Object.entries(tableData);
    const midPoint = Math.ceil(entries.length / 2);

    const leftColumnEntries = entries.slice(0, midPoint);
    const rightColumnEntries = entries.slice(midPoint);

    const createColumnHtml = (columnEntries: [string, unknown][]): string => {
      return columnEntries
        .map(
          ([key, value]) => `
        <tr>
          <td style="padding: 1px 8px 1px 0; font-weight: bold; vertical-align: top; white-space: nowrap;">${key}</td>
          <td style="padding: 1px; vertical-align: top;">${value}</td>
        </tr>
      `
        )
        .join('');
    };

    const leftColumnHtml = createColumnHtml(leftColumnEntries);
    const rightColumnHtml = createColumnHtml(rightColumnEntries);

    return `
      <div style="margin-top: 15px; font-family: sans-serif; font-size: 11px;">
        <div style="font-weight: bold; font-size: 13px; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 5px;">
          ${headerTitle}
        </div>
        
        <table style="width: 100%; border-collapse: collapse; vertical-align: top;">
          <tbody>
            <tr>
              <td style="width: 50%; padding-right: 15px; vertical-align: top;">
                <table style="width: 100%;">
                  <tbody>${leftColumnHtml}</tbody>
                </table>
              </td>
              <td style="width: 50%; padding-left: 15px; vertical-align: top;">
                <table style="width: 100%;">
                  <tbody>${rightColumnHtml}</tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
}
