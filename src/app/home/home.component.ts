// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { PdfService } from '../pdf.service'; // Ensure correct path to your service

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  constructor(private pdfService: PdfService) {}

  downloadPdf(): void {
    const htmlContent: string = `
      <h1>Welcome to Your Sample PDF!</h1>
      <p>This PDF was generated on <b>bold</b> using jsPDF and Angular.</p>
      <p>Here are some sample items:</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>A longer item to test auto-paging. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
      </ul>
    `;

    const options = {
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      marginTop: 40,
      marginRight: 10,
      marginBottom: 10,
      marginLeft: 10,
      backgroundImageSrc:'base64 image or image from public',
      filename: 'sample_document.pdf',
    };

    // Reverted to calling 'generatePdf'
    this.pdfService.generatePdf(htmlContent, options);
  }
}
