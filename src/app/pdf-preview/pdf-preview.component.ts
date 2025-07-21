import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  SecurityContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { PdfService } from '../pdf.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-pdf-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css'],
})
export class PdfGeneratorComponent implements OnChanges {
  @Input() contentHtml: string = '<p>No content provided.</p>';
  @Input() options: any = { format: 'a4' };

  protected previewHtml: SafeHtml | null = null;
  protected previewStyles: { [key: string]: string } = {};

  constructor(
    private pdfService: PdfService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Re-generate the preview whenever the inputs change.
    if (changes['contentHtml'] || changes['options']) {
      this.generatePreview();
    }
  }

  private generatePreview(): void {
    if (!this.options) {
      this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(
        this.contentHtml
      );
      return;
    }

    // Create a temporary jsPDF instance to get page dimensions dynamically.
    const tempDoc = new jsPDF(this.options);
    const pageWidth = tempDoc.internal.pageSize.getWidth();
    const pageHeight = tempDoc.internal.pageSize.getHeight();

    // Create dynamic styles for the preview container to match the PDF options.
    this.previewStyles = {
      // Use the exact dimensions from jsPDF to set the aspect ratio.
      '--page-aspect-ratio': `${pageWidth} / ${pageHeight}`,
      '--page-bg-image': `url('${this.options.backgroundImageSrc || ''}')`,
      // We use px for CSS styling, the service will use the correct units ('mm').
      '--page-margin-top': `${this.options.marginTop || 0}px`,
      '--page-margin-right': `${this.options.marginRight || 0}px`,
      '--page-margin-bottom': `${this.options.marginBottom || 0}px`,
      '--page-margin-left': `${this.options.marginLeft || 0}px`,
    };

    // The preview HTML is just the user's content. All styling is applied via CSS.
    // We sanitize the raw HTML to prevent security issues.
    this.previewHtml = this.sanitizer.sanitize(
      SecurityContext.HTML,
      this.contentHtml
    );
  }

  public downloadPdf(): void {
    // Pass the original, clean HTML and options to the service.
    // The service is responsible for handling pagination and backgrounds in the final PDF.
    this.pdfService.generatePdf(this.contentHtml, this.options);
  }
}
