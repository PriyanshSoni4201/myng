import { Component } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { PdfService } from '../pdf.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true, // Set to true for consistency with standalone project structure
  imports: [CommonModule], // Import CommonModule for [innerHTML]
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  // Common options for both preview and PDF generation
  options = {
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    marginTop: 40,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10,
    // Updated to use the local image from the public folder
    backgroundImageSrc: 'public/bg.png',
    filename: 'sample_document.pdf',
  };

  // The raw HTML content for the document's body
  contentHtml: string = `
    <div class="content-wrapper">
      <h1>Welcome to Your Sample PDF!</h1>
      <p>This PDF was generated on <b>bold</b> using jsPDF and Angular.</p>
      <p>Here are some sample items:</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>A longer item to test auto-paging. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
      </ul><ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
        <li>A longer item to test auto-paging. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
      </ul>
    </div>
  `;

  // This will hold the sanitized HTML for the live preview
  previewHtml: SafeHtml;

  constructor(private pdfService: PdfService, private sanitizer: DomSanitizer) {
    this.previewHtml = this.createPreviewHtml();
  }

  private createPreviewHtml(): SafeHtml {
    // This wrapper is for the PREVIEW ONLY. It combines a background div and the content.
    // The background is added via an inline style for dynamic control.
    const previewWrapperHtml = `
      <div class="preview-background" style="background-image: url('${this.options.backgroundImageSrc}')"></div>
      ${this.contentHtml}
    `;
    // Sanitize the dynamically created HTML to be safely used with [innerHTML]
    return this.sanitizer.bypassSecurityTrustHtml(previewWrapperHtml);
  }

  downloadPdf(): void {
    // For the actual PDF, we pass the CLEAN contentHtml and the options object.
    // The PdfService is responsible for adding the background image to each page of the PDF,
    // which is more reliable than trying to render an HTML background in the PDF.
    this.pdfService.generatePdf(this.contentHtml, this.options);
  }
}
