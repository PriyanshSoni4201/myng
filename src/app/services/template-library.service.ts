import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemplateLibraryService {
  constructor() {}

  /**
   * Acts as a router, taking a JSON item from the `contentItems` array
   * and directing it to the correct private builder function based on its properties.
   * @param item A single object from the `contentMaster.contentItems` array.
   * @returns An HTML string for the corresponding component.
   */
  public getSnippet(item: any): string {
    if (item.isHeaderComponent) {
      return this.buildPatientHeader(item);
    }

    // This will be expanded with `else if` blocks for other component types.
    // e.g., else if (item.isParagraph) { return this.buildSimpleParagraph(item); }

    return `<div style="color: #ccc; border: 1px dashed #ccc; padding: 10px; margin-top: 15px;">(Component type '${item.header}' not yet implemented)</div>`;
  }

  /**
   * Builds the HTML for the two-column patient information header.
   *
   * @param item The JSON object for this component.
   * @expects_json {
   *   "header": "Patient Information",
   *   "isHeaderComponent": true,
   *   "HeaderValueComponentColumn": 2,
   *   "tableData": {
   *     "UHID": "...",
   *     "Name": "...",
   *     "Address": "...",
   *     "Encounter Type": "...",
   *     "Diagnosis": "...",
   *     "Encounter No.": "...",
   *     "Ref. By": "...",
   *     "Date": "...",
   *     "Time": "..."
   *   }
   * }
   */
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
          <td style="padding: 2px 8px 2px 2px; font-weight: bold; vertical-align: top;">${key}</td>
          <td style="padding: 2px; vertical-align: top;">${value}</td>
        </tr>
      `
        )
        .join('');
    };

    const leftColumnHtml = createColumnHtml(leftColumnEntries);
    const rightColumnHtml = createColumnHtml(rightColumnEntries);

    return `
      <div style="margin-top: 15px; font-family: sans-serif; font-size: 12px;">
        <div style="font-weight: bold; font-size: 14px; border-bottom: 2px solid #333; padding-bottom: 4px; margin-bottom: 8px;">
          ${headerTitle}
        </div>
        <div style="display: flex; width: 100%;">
          <div style="width: 50%; padding-right: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>${leftColumnHtml}</tbody>
            </table>
          </div>
          <div style="width: 50%; padding-left: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>${rightColumnHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
}
