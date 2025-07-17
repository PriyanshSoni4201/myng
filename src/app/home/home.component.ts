import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfService } from '../pdf.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  initialHtmlContent = `
    <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; font-size: 12pt;">
      <h2 style="color: #6a0dad; text-align: center;">Document with Configurable Settings</h2>
      <p>
        This document demonstrates dynamic PDF generation with custom margins, paper
        type, and a background image, all controlled via the configuration JSON.
      </p>
      <p>
        Here's some <em style="color: blue;">emphasized text</em>, <strong>bold text</strong>, and <span style="text-decoration: underline; color: green;">underlined text</span>.
      </p>
      <p style="text-indent: 20px;">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <div style="border: 1px solid #ccc; padding: 10px; margin: 15px 0; background-color: #f0f8ff;">
        <h3>A Small Box</h3>
        <p>This is a small example of content within a styled box.</p>
        <img src="https://i.imgur.com/h4j6w4s.jpeg" alt="Small Phone Image" style="display: block; margin: 10px auto; max-width: 150px; height: auto; border: 1px solid #999;">
      </div>
      <p style="font-style: italic; color: #888;">
        This paragraph is meant to illustrate some more text content that will help push the document to a second page to properly demonstrate the background functionality on all pages.
      </p>

      <h2 style="color: #3e8e41; margin-top: 30px;">Product Sales Report</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background-color: #e6ffe6; color: #333;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product Name</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Quantity Sold</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Unit Price ($)</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Sales ($)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="border: 1px solid #ddd; padding: 8px;">Laptop X1</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">5</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1200.00</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">6000.00</td></tr>
          <tr style="background-color: #f8f8f8;"><td style="border: 1px solid #ddd; padding: 8px;">Monitor Pro</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">10</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">300.00</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">3000.00</td></tr>
          <tr><td style="border: 1px solid #ddd; padding: 8px;">Keyboard Mech</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">15</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">80.00</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1200.00</td></tr>
          <tr style="background-color: #f8f8f8;"><td style="border: 1px solid #ddd; padding: 8px;">Mouse Optic</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">20</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">25.00</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">500.00</td></tr>
        </tbody>
        <tfoot>
          <tr style="background-color: #d4edda; font-weight: bold;"><td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Grand Total:</td><td style="border: 1px solid #ddd; padding: 8px; text-align: right;">10700.00</td></tr>
        </tfoot>
      </table>
      <p style="text-align: center; color: #555; font-size: 0.9em; margin-top: 30px;">
        Report generated on July 16, 2025.
      </p>
    </div>
  `;

  htmlInput = signal(this.initialHtmlContent);
  configInput = signal(
    JSON.stringify(
      {
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        marginTop: 40,
        marginBottom: 35,
        marginLeft: 15,
        marginRight: 15,
        // Using the correct local path for the background image
        backgroundImageSrc: '/public/bg.png',
        filename: 'document-with-template.pdf',
      },
      null,
      2
    )
  );

  currentConfig = signal<any>({});

  constructor(private pdfService: PdfService) {
    this.updateCurrentConfig(this.configInput());
  }

  updateCurrentConfig(configString: string) {
    try {
      this.currentConfig.set(JSON.parse(configString));
    } catch (e) {
      this.currentConfig.set({});
    }
  }

  handleConfigChange(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.configInput.set(textarea.value);
    this.updateCurrentConfig(textarea.value);
  }

  async handleGeneratePdf() {
    try {
      const config = this.currentConfig();
      if (Object.keys(config).length === 0) {
        alert('Configuration is invalid. Please provide a valid JSON.');
        return;
      }

      const pdfBlob = await this.pdfService.generatePdf(
        this.htmlInput(),
        config
      );

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = config.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
    }
  }
}
