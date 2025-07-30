import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TemplateLibraryService {
  constructor() {}

  public getSnippet(item: any): string {
    if (item.isHeaderComponent) {
      return this.buildPatientInfoCard(item);
    }

    return `<div style="color: #ccc; border: 1px dashed #ccc; padding: 10px; margin-top: 15px;">(Component type '${item.header}' not yet implemented)</div>`;
  }

  /**
   * Builds the HTML for the Patient Info Card component.
   * This matches the gray, two-column card with a top bar.
   */
  private buildPatientInfoCard(item: any): string {
    const data = item.tableData || {};

    // Data for the top bar
    const name = data.Name || '';
    const date = data.Date || '';
    const time = data.Time || '';

    // Data for the two columns below
    const leftColumnData = {
      UHID: data.UHID,
      'Encounter No.': data['Encounter No.'],
      Address: data.Address,
      Diagnosis: data.Diagnosis,
    };

    const rightColumnData = {
      Consultant: data['Ref. By'], // Assuming 'Ref. By' is the consultant
      'Ref. By': data['Ref. By'],
      'Payer Class': data['Payer Class'] || 'Self', // Defaulting as per image
    };

    // Helper function to create the HTML for a column's rows
    const createColumnHtml = (columnData: Record<string, string>): string => {
      return Object.entries(columnData)
        .map(
          ([key, value]) => `
        <tr>
          <td style="padding: 2px 8px 2px 2px; font-weight: bold; vertical-align: top; white-space: nowrap;">${key}</td>
          <td style="padding: 2px; vertical-align: top;">${value || ''}</td>
        </tr>
      `
        )
        .join('');
    };

    const leftColumnHtml = createColumnHtml(leftColumnData);
    const rightColumnHtml = createColumnHtml(rightColumnData);

    // User icon as an inline SVG for portability
    const userIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="black"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

    return `
      <div style="margin-top: 15px; font-family: sans-serif; font-size: 11px; background-color: #e0e0e0;">
        <!-- Top Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; border-bottom: 1px solid #c0c0c0;">
          <div style="display: flex; align-items: center; font-weight: bold;">
            <span style="margin-right: 8px;">${userIconSvg}</span>
            <span>${name}</span>
          </div>
          <div style="font-weight: bold;">
            <span>${date} | ${time}</span>
          </div>
        </div>

        <!-- Bottom Content Area -->
        <div style="display: flex; width: 100%;">
          <!-- Left Column -->
          <div style="width: 50%; padding: 5px 15px 5px 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>${leftColumnHtml}</tbody>
            </table>
          </div>
          
          <!-- Vertical Separator -->
          <div style="width: 1px; background-color: #b0b0b0;"></div>
          
          <!-- Right Column -->
          <div style="width: 50%; padding: 5px 8px 5px 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>${rightColumnHtml}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  /*
  SAMPLE INPUT for buildPatientInfoCard:
  {
    "header": "Patient Information",
    "isHeaderComponent": true,
    "HeaderValueComponentColumn": 2,
    "tableData": {
      "UHID": "13121200000030",
      "Name": "Aaradhana Rajeshwaran Balasubramanian (F / 35Y 10M)",
      "Address": "Malad East, Mumbai",
      "Encounter Type": "Asymptomatic Follow",
      "Diagnosis": "Hypertension & Diabetes",
      "Encounter No.": "RFT-20250618-0423",
      "Ref. By": "Dr. Anita Sharma",
      "Date": "25-Jun-2025",
      "Time": "18:15"
    }
  }
  */
}
