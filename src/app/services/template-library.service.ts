import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemplateLibraryService {
  constructor() {}

  public getSnippet(item: any): string {
    // --- CRITICAL FIX FOR COMPONENT IDENTIFICATION ---
    // Create a temporary contentType to standardize the logic.
    let contentType = item.contentType;
    if (item.isHeaderComponent) {
      contentType = 'PatientHeader';
    }
    // --- END OF FIX ---

    switch (contentType) {
      case 'PatientHeader':
        return this.buildPatientInfoCard(item);
      case 'Paragraph':
        return this.buildSimpleParagraph(item);
      case 'TableViewWithLine':
        return this.buildStandardTable(item);
      case 'TitleValueComponent':
        return this.buildKeyValueList(item);
      case 'Signature':
        return this.buildSignatureBlock(item);
      // This case handles the new page break object we create in the preview component
      case 'PageBreak':
        return '<div class="pdf-page-break"></div>';
      default:
        return `<div style="color: #ccc; border: 1px dashed #ccc; padding: 10px; margin-top: 15px;">(Component type '${
          contentType || 'undefined'
        }' not yet implemented)</div>`;
    }
  }

  private buildPatientInfoCard(item: any): string {
    const data = item.tableData || {};
    const name = data.Name || '';
    const date = data.Date || '';
    const time = data.Time || '';
    const leftColumnData = {
      UHID: data.UHID,
      'Encounter No.': data['Encounter No.'],
      Address: data.Address,
      Diagnosis: data.Diagnosis,
    };
    const rightColumnData = {
      Consultant: data['Ref. By'],
      'Ref. By': data['Ref. By'],
      'Payer Class': data['Payer Class'] || 'Self',
    };
    const createColumnHtml = (columnData: Record<string, string>): string => {
      return Object.entries(columnData)
        .map(
          ([key, value]) =>
            `<tr><td style="padding: 2px 8px 2px 2px; font-weight: bold; vertical-align: top; white-space: nowrap;">${key}</td><td style="padding: 2px; vertical-align: top;">${
              value || ''
            }</td></tr>`
        )
        .join('');
    };
    const leftColumnHtml = createColumnHtml(leftColumnData);
    const rightColumnHtml = createColumnHtml(rightColumnData);
    const userIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
    return `<div style="margin-top: 15px; font-family: sans-serif; font-size: 11px; background-color: #e0e0e0;"><div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-bottom: 1px solid #c0c0c0;"><div style="display: flex; align-items: center; font-weight: bold;"><span style="margin-right: 8px;">${userIconSvg}</span><span>${name}</span></div><div style="font-weight: bold;"><span>${date} | ${time}</span></div></div><div style="display: flex; width: 100%;"><div style="width: 50%; padding: 5px 15px 5px 8px;"><table style="width: 100%; border-collapse: collapse;"><tbody>${leftColumnHtml}</tbody></table></div><div style="width: 1px; background-color: #b0b0b0;"></div><div style="width: 50%; padding: 5px 8px 5px 15px;"><table style="width: 100%; border-collapse: collapse;"><tbody>${rightColumnHtml}</tbody></table></div></div></div>`;
  }

  private buildSimpleParagraph(item: any): string {
    const headerTitle = item.header || '';
    const content = item.content || '';
    const borderStyle = 'border-bottom: 1px solid #c0c0c0;';
    return `<div style="margin-top: 15px; font-family: sans-serif; font-size: 11px;"><div style="font-weight: bold; font-size: 13px; padding-bottom: 2px; margin-bottom: 5px; ${borderStyle}">${headerTitle}</div><p style="line-height: 1.4; padding-top: 2px; margin: 0;">${content}</p></div>`;
  }

  private buildStandardTable(item: any): string {
    const headerTitle = item.header || '';
    const tableData = item.tableData || [];
    const borderStyle = 'border-bottom: 1px solid #c0c0c0;';
    if (tableData.length === 0) return '';
    const headers = Object.keys(tableData[0]);
    const headerHtml = headers
      .map(
        (h) =>
          `<th style="text-align: left; padding: 4px; font-weight: bold;">${h}</th>`
      )
      .join('');
    const rowsHtml = tableData
      .map((row: any) => {
        const cellsHtml = headers
          .map(
            (h) =>
              `<td style="padding: 4px; vertical-align: top;">${row[h]}</td>`
          )
          .join('');
        return `<tr>${cellsHtml}</tr>`;
      })
      .join('');
    return `<div style="margin-top: 15px; font-family: sans-serif; font-size: 11px;"><div style="font-weight: bold; font-size: 13px; padding-bottom: 2px; margin-bottom: 5px; ${borderStyle}">${headerTitle}</div><table style="width: 100%; border-collapse: collapse; margin-top: 5px;"><thead><tr style="border-bottom: 1px solid #999;">${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table></div>`;
  }

  private buildKeyValueList(item: any): string {
    const headerTitle = item.header || '';
    const tableData = item.tableData || [];
    const borderStyle = 'border-bottom: 1px solid #c0c0c0;';
    const recordsHtml = tableData
      .map((record: any, index: number) => {
        const { 'No.': noValue, ...restData } = record;
        const entries = Object.entries(restData);
        const firstColumnHtml = `<div><div style="color: #555; font-size: 10px;">No.</div><div style="font-weight: bold; margin-top: 2px;">${noValue}</div></div>`;
        const otherColumnsHtml = entries
          .map(
            ([key, value]) =>
              `<div><div style="color: #555; font-size: 10px;">${key}</div><div style="font-weight: bold; margin-top: 2px;">${value}</div></div>`
          )
          .join('');
        const separatorStyle =
          index > 0
            ? 'border-top: 1px solid #eee; padding-top: 12px; margin-top: 12px;'
            : '';
        return `<div style="display: flex; gap: 15px; ${separatorStyle}"><div style="flex: 0 0 50px;">${firstColumnHtml}</div><div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 15px;">${otherColumnsHtml}</div></div>`;
      })
      .join('');
    return `<div style="margin-top: 15px; font-family: sans-serif; font-size: 11px;"><div style="font-weight: bold; font-size: 13px; padding-bottom: 2px; margin-bottom: 8px; ${borderStyle}">${headerTitle}</div><div>${recordsHtml}</div></div>`;
  }

  private buildSignatureBlock(item: any): string {
    const data = item.tableData || {};
    const doctors = data.listOfDoctors || [];
    const number = data.number || '';
    const datetime = data.datetime || '';
    const doctorsHtml = doctors
      .map(
        (doctor: string) =>
          `<div style="display: inline-block; text-align: center; margin-left: 50px;"><div style="height: 40px; border-bottom: 1px solid #333;"></div><div style="font-weight: bold;">${doctor}</div></div>`
      )
      .join('');
    return `<div style="margin-top: 40px; font-family: sans-serif; font-size: 11px; text-align: right;">${doctorsHtml}<div style="margin-top: 10px; font-size: 10px; color: #555;"><div>${number}</div><div>${datetime}</div></div></div>`;
  }
}
