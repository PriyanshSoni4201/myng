import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-pdf-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-generator.component.html',
  styleUrls: ['./pdf-generator.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PdfGeneratorComponent implements OnChanges {
  @Input() options: any = { unit: 'mm', format: 'a4' };
  @Input() backgroundImageSrc: string = '';
  @Input() mainContentHtml: string = '';
  @Input() topMarginMm: number = 0;
  @Input() bottomMarginMm: number = 0;
  @Input() sideMarginMm: number = 0;

  // This is now only for the visual preview
  protected previewHtml: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    // We only need to construct the preview when data changes.
    this.constructPreview();
  }

  private constructPreview(): void {
    const tempDoc = new jsPDF(this.options);
    const pageW_mm = tempDoc.internal.pageSize.getWidth();
    const pageH_mm = tempDoc.internal.pageSize.getHeight();

    // The preview construction remains the same, as it provides a good visual guide.
    const previewHtmlString = this._buildPreviewHtml(
      this.mainContentHtml,
      pageW_mm,
      pageH_mm
    );
    this.previewHtml =
      this.sanitizer.bypassSecurityTrustHtml(previewHtmlString);
  }

  private _buildPreviewHtml(
    content: string,
    widthMm: number,
    heightMm: number
  ): string {
    const contentWidthMm = widthMm - this.sideMarginMm * 2;

    return `
      <div class="pdf-page-container" style="width: ${widthMm}mm; height: ${heightMm}mm;">
        <img class="pdf-background-image" src="${this.backgroundImageSrc}" />
        <div class="pdf-content-wrapper">
            <div class="pdf-spacer-top" style="height: ${this.topMarginMm}mm;"></div>
            <div class="pdf-content-area" style="width: ${contentWidthMm}mm; margin: 0 ${this.sideMarginMm}mm;">
              ${content}
            </div>
        </div>
      </div>
    `;
  }

  public async downloadPdf(): Promise<void> {
    const doc = new jsPDF(this.options);
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const contentW = pageW - this.sideMarginMm * 2;

    // 1. Add the background image FIRST. This makes it the bottom layer.
    if (this.backgroundImageSrc) {
      doc.addImage(this.backgroundImageSrc, 'PNG', 0, 0, pageW, pageH);
    }

    // 2. Render the HTML content on TOP of the image.
    await doc.html(this.mainContentHtml, {
      // We are no longer using autoPaging for this single-page example.
      // We will re-introduce it correctly later.
      autoPaging: 'text',

      // Use the options to position the content correctly.
      x: this.sideMarginMm,
      y: this.topMarginMm,

      // Tell the renderer the exact width the content should occupy.
      width: contentW,
      windowWidth: 800, // A reasonable virtual browser width for consistent text wrapping.
    });

    doc.save(this.options.filename || 'document.pdf');
  }
}
