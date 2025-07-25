import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfGeneratorComponent } from '../pdf-generator/pdf-generator.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PdfGeneratorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  // PDF Generator Options
  pdfOptions = {
    unit: 'mm',
    format: 'a4',
    orientation: 'p',
    filename: 'Medical-Report-Final-Grouped.pdf',
  };
  topMarginMm = 33;
  bottomMarginMm = 15;
  sideMarginMm = 10;
  backgroundImageSrc = 'public/bg.png';

  // This will hold the final, generated HTML. It starts as null to prevent initial rendering.
  mainContentHtml: string | null = null;

  constructor(private zone: NgZone) {}

  /**
   * Handles the JSON file upload, reads its content, and triggers the HTML build process.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== 'application/json') {
      alert('Invalid file type. Please upload a .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        const data = JSON.parse(fileContent);
        this.zone.run(() => {
          this.mainContentHtml = this.buildHtmlFromData(data);
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
        this.zone.run(() => {
          this.mainContentHtml =
            '<h1 style="color: red;">Error: The selected file is not valid JSON.</h1>';
        });
      }
    };
    reader.readAsText(file);
  }

  /**
   * Handles content updates emitted from the editor in the child component.
   */
  handleContentChange(newHtml: string): void {
    this.mainContentHtml = newHtml;
  }

  /**
   * Main function to orchestrate the building of the entire report HTML from JSON data.
   * @param data The parsed JSON object.
   * @returns The complete HTML string for the report.
   */
  private buildHtmlFromData(data: any): string {
    const repeatingHeaderHtml = this._buildRepeatingHeader(data.patientInfo);
    let elementIndex = 0;
    let fullHtml = '';

    data.pages.forEach((page: any, pageIndex: number) => {
      // Add the repeating header to the start of every page's content
      fullHtml += repeatingHeaderHtml;

      page.sections.forEach((section: any) => {
        const id = `pdf-element-${elementIndex++}`;
        fullHtml += `<div id="${id}" style="margin-top: 15px;">`;
        fullHtml += `<div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">${section.title}</div>`;

        // Use a switch to build the correct type of content for the section
        switch (section.type) {
          case 'simple':
            fullHtml += `<div style="font-family: sans-serif; font-size: 11px; margin-top: 3px;">${section.content}</div>`;
            break;
          case 'table':
            fullHtml += this._buildTable(section.table);
            break;
          case 'vitals':
            fullHtml += this._buildVitalsTable(section.vitals);
            break;
          case 'generalExamination':
            fullHtml += this._buildGeneralExaminationTable(section.items);
            break;
          case 'signature':
            fullHtml += this._buildSignatureBlock(data.signature);
            break;
        }
        fullHtml += `</div>`;
      });

      // Add a page break hint after each page's content, except for the last one
      if (pageIndex < data.pages.length - 1) {
        fullHtml += '<div style="height: 1px;"></div>';
      }
    });

    return fullHtml;
  }

  /**
   * Builds the complex repeating header block.
   * @param info The patientInfo object from JSON.
   * @returns An HTML string for the header.
   */
  private _buildRepeatingHeader(info: any): string {
    return `
      <div>
          <div style="width: 100%; text-align: center;">
              <div style="font-family: sans-serif; font-weight: bold; font-size: 14px; padding-bottom: 5px;">
                  ${info.reportTitle}
              </div>
          </div>
          <div style="font-family: sans-serif; font-size: 11px; background-color: #e0e0e0; border-top: 1px solid #777; border-bottom: 1px solid #777; padding: 2px 4px;">
              <div style="display: inline-block; width: 60%; font-weight: bold;">
                  <img src="public/user-icon.png" alt="icon" style="height: 12px; width: 12px; vertical-align: middle; margin-right: 5px;">${info.patientName} (${info.gender} / ${info.age})
              </div>
              <div style="display: inline-block; width: 39%; text-align: right; font-weight: bold;">
                  ${info.date} | ${info.time}
              </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; background-color: #e0e0e0;">
              <tbody>
                  <tr>
                      <td style="width: 50%; vertical-align: top; padding: 5px;">
                          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                              <tr><td style="font-weight: bold; padding: 1px 2px; width: 100px;">UHID</td><td style="padding: 1px 2px;">${info.uhid}</td></tr>
                              <tr><td style="font-weight: bold; padding: 1px 2px;">Encounter No.</td><td style="padding: 1px 2px;">${info.encounterNo}</td></tr>
                              <tr><td style="font-weight: bold; padding: 1px 2px;">Address</td><td style="padding: 1px 2px;">${info.address}</td></tr>
                              <tr><td style="font-weight: bold; padding: 1px 2px;">Diagnosis</td><td style="padding: 1px 2px;">${info.diagnosis}</td></tr>
                          </table>
                      </td>
                      <td style="width: 1px; background-color: #b0b0b0;"></td>
                      <td style="width: 49%; vertical-align: top; padding: 5px;">
                          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                              <tr><td style="font-weight: bold; padding: 1px 2px; width: 80px;">Consultant</td><td style="padding: 1px 2px;">${info.consultant}</td></tr>
                              <tr><td style="font-weight: bold; padding: 1px 2px;">Ref. By</td><td style="padding: 1px 2px;">${info.referredBy}</td></tr>
                              <tr><td style="font-weight: bold; padding: 1px 2px;">Payer Class</td><td style="padding: 1px 2px;">${info.payerClass}</td></tr>
                          </table>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
    `;
  }

  /**
   * Builds a standard data table with headers and rows.
   * @param tableData The table object from JSON, containing headers and rows.
   * @returns An HTML string for the table.
   */
  private _buildTable(tableData: any): string {
    const headers = tableData.headers
      .map(
        (h: any) =>
          `<th style="text-align: left; padding: 2px; font-weight: bold; width: ${
            h.width || 'auto'
          };">${h.label}</th>`
      )
      .join('');
    const rows = tableData.rows
      .map((row: any[]) => {
        const cells = row
          .map(
            (cell) =>
              `<td style="padding: 2px; vertical-align: top;">${cell}</td>`
          )
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    return `
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr>${headers}</tr></thead>
          <tbody>${rows}</tbody>
      </table>
    `;
  }

  /**
   * Builds the specific key-value table for Vitals.
   * @param vitalsData The vitals object from JSON.
   * @returns An HTML string for the vitals table.
   */
  private _buildVitalsTable(vitalsData: any): string {
    const headers = vitalsData
      .map(
        (v: any) =>
          `<th style="padding: 2px; font-weight: bold;">${v.label}</th>`
      )
      .join('');
    const values = vitalsData
      .map((v: any) => `<td style="padding: 2px;">${v.value} ${v.unit}</td>`)
      .join('');
    return `
      <table style="width: 100%; border-collapse: collapse; text-align: center; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr>${headers}</tr></thead>
          <tbody><tr>${values}</tr></tbody>
      </table>
    `;
  }

  /**
   * Builds the two-column key-value table for General Examination.
   * @param items The array of examination items from JSON.
   * @returns An HTML string for the table.
   */
  private _buildGeneralExaminationTable(items: any[]): string {
    let rowsHtml = '';
    for (let i = 0; i < items.length; i += 2) {
      const item1 = items[i];
      const item2 = items[i + 1];
      rowsHtml += `
        <tr>
            <td style="width: 25%; font-weight: bold; padding: 2px; vertical-align: top;">${
              item1.label
            }</td>
            <td style="width: 25%; padding: 2px; vertical-align: top;">${
              item1.value
            }</td>
            ${
              item2
                ? `
            <td style="width: 25%; font-weight: bold; padding: 2px; vertical-align: top;">${item2.label}</td>
            <td style="width: 25%; padding: 2px; vertical-align: top;">${item2.value}</td>
            `
                : '<td></td><td></td>'
            }
        </tr>
      `;
    }
    return `
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <tbody>${rowsHtml}</tbody>
      </table>
    `;
  }

  /**
   * Builds the signature block at the end of the report.
   * @param signatureData The signature object from JSON.
   * @returns An HTML string for the signature.
   */
  private _buildSignatureBlock(signatureData: any): string {
    return `
        <div style="text-align: right; margin-top: 20px; font-family: sans-serif; font-size: 11px;">
            <div style="display: inline-block; text-align: center; margin-right: 20px;">
                <div style="height: 20px;"></div>
                <p style="margin: 0; padding-top: 2px; border-top: 1px solid #4a4a4a;">
                    ${signatureData.name}<br>
                    (${signatureData.credentials})<br>
                    Registration no (${signatureData.registrationNo})
                </p>
            </div>
        </div>
      `;
  }
}
