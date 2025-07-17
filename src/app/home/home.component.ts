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
      <h2 style="color: #6a0dad; text-align: center;">Document with Atomic Blocks</h2>
      <p>
        This document demonstrates how to prevent certain elements, like the table below, from being split across page breaks.
      </p>
      <p style="text-indent: 20px;">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
      </p>
      

      <!-- THIS IS THE ATOMIC BLOCK -->
      <!-- By wrapping the table in this div, we ensure it never breaks -->
      <div class="jspdf-prevent-break">
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
        <p style="text-align: center; color: #555; font-size: 0.9em; margin-top: 10px;">
          Report generated on July 16, 2025.
        </p>
      </div>

      <p style="font-style: italic; color: #888; margin-top: 20px;">
        This final paragraph appears after the atomic block.
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
