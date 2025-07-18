import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PdfService } from '../pdf.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  initialHtmlContent = `
    <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; font-size: 12pt;">
      <h2 style="color: #6a0dad; text-align: center;">Document with Atomic Blocks</h2>
      <p>This document demonstrates how to prevent certain elements, like the table below, from being split across page breaks.</p>
      <p style="text-indent: 20px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
      <p>Lorem ipsum dolor sit amet...</p>
      <div>
        <h2 style="color: #3e8e41;">Product Sales Report</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead><tr style="background-color: #e6ffe6;"><th>Product Name</th><th>Quantity Sold</th><th>Unit Price ($)</th><th>Total Sales ($)</th></tr></thead>
          <tbody>
            <tr><td>Laptop X1</td><td style="text-align:right;">5</td><td style="text-align:right;">1200.00</td><td style="text-align:right;">6000.00</td></tr>
            <tr style="background-color: #f8f8f8;"><td>Monitor Pro</td><td style="text-align:right;">10</td><td style="text-align:right;">300.00</td><td style="text-align:right;">3000.00</td></tr>
            <tr><td>Keyboard Mech</td><td style="text-align:right;">15</td><td style="text-align:right;">80.00</td><td style="text-align:right;">1200.00</td></tr>
            <tr style="background-color: #f8f8f8;"><td>Mouse Optic</td><td style="text-align:right;">20</td><td style="text-align:right;">25.00</td><td style="text-align:right;">500.00</td></tr>
          </tbody>
          <tfoot><tr style="background-color: #d4edda; font-weight: bold;"><td colspan="3" style="text-align:right;">Grand Total:</td><td style="text-align:right;">10700.00</td></tr></tfoot>
        </table>
        <p style="text-align: center; color: #555;">Report generated on July 16, 2025.</p>
      </div>
      <p style="font-style: italic; color: #888;">This final paragraph appears after the atomic block.</p>
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
        backgroundImageSrc: '/public/bg.png',
        filename: 'document-atomic-blocks.pdf',
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
