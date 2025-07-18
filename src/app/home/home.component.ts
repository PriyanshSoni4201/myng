// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { PdfService } from '../pdf.service';

@Component({
  selector: 'app-home',
  template: ` <button (click)="downloadPdf()">Download Sample PDF</button> `,
  styles: [``],
})
export class HomeComponent {
  constructor(private pdfService: PdfService) {}

  async downloadPdf() {
    const htmlContent: string = `
    <h1>hi</h1>
    `;

    const options = {
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      marginTop: 40,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10,
      backgroundImageSrc: 'public/bg.png',
    };

    try {
      const pdfBlob: Blob = await this.pdfService.generatePdf(
        htmlContent,
        options
      );

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample_document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  }
}
