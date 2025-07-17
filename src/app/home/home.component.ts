import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfService } from '../pdf.service';

// REMOVE THESE IMPORTS. They are no longer needed or correct for this setup.
// import bmcImage from '../../assets/bmc.png';
// import bgImage from '../../assets/bg.png';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  initialHtmlContent = `
    <div style="font-family: 'Times New Roman', serif; line-height: 1.4; color: #444;">
      <h2 style="color: #6a0dad; text-align: center;">Document with Configurable Settings</h2>
      <p style="font-size: 1.1em; margin-bottom: 15px;">
        This document demonstrates dynamic PDF generation with custom margins, paper type, and a background image, all controlled via the configuration JSON.
      </p>
      <p>
        Here's some <em style="color: blue;">emphasized text</em>, <strong>bold text</strong>, and <span style="text-decoration: underline; color: green;">underlined text</span>.
      </p>
      <p style="text-indent: 20px;">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <div style="border: 1px solid #ccc; padding: 10px; margin: 10px 0; background-color: #f0f8ff;">
        <h3>A Small Box</h3>
        <p>This is a small example of content within a styled box.</p>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/100px-Image_created_with_a_mobile_phone.png" alt="Small Phone Image" style="display: block; margin: 10px auto; max-width: 80px; height: auto; border: 1px solid #999;">
      </div>
      <p style="font-style: italic; color: #888;">
        This paragraph is meant to illustrate some more text content.
      </p>

      <h2 style="color: #3e8e41;">Product Sales Report</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #e6ffe6; color: #333;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product Name</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Quantity Sold</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Unit Price ($)</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total Sales ($)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Laptop X1</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">5</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1200.00</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">6000.00</td>
          </tr>
          <tr style="background-color: #f8f8f8;">
            <td style="border: 1px solid #ddd; padding: 8px;">Monitor Pro</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">10</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">300.00</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">3000.00</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Keyboard Mech</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">15</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">80.00</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">1200.00</td>
          </tr>
          <tr style="background-color: #f8f8f8;">
            <td style="border: 1px solid #ddd; padding: 8px;">Mouse Optic</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">20</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">25.00</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">500.00</td>
          </tr>
        </tbody>
        <tfoot>
          <tr style="background-color: #d4edda; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Grand Total:</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">10700.00</td>
          </tr>
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
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 25,
        marginRight: 25,
        // Now reference from the new public path
        backgroundImageSrc: '/public/bg.png',
      },
      null,
      2
    )
  );

  currentConfig = signal({});

  constructor(private pdfService: PdfService) {
    this.updateCurrentConfig(this.configInput());
  }

  updateCurrentConfig(configString: string) {
    try {
      this.currentConfig.set(JSON.parse(configString));
    } catch (e) {
      console.error('Invalid JSON config:', e);
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
      const pdfBlob = await this.pdfService.generatePdf(
        this.htmlInput(),
        this.currentConfig()
      );
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details.');
    }
  }
}
