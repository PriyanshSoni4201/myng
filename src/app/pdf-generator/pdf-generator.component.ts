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

  private contentChunks: string[] = [];
  protected safePagesForPreview: SafeHtml[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.constructPages();
  }

  private constructPages(): void {
    const tempDoc = new jsPDF(this.options);
    const pageW_mm = tempDoc.internal.pageSize.getWidth();
    const pageH_mm = tempDoc.internal.pageSize.getHeight();

    const previewWidthPx = 700;
    const pxPerMm = previewWidthPx / pageW_mm;
    const contentW_px = (pageW_mm - this.sideMarginMm * 2) * pxPerMm;
    const contentH_px =
      (pageH_mm - this.topMarginMm - this.bottomMarginMm) * pxPerMm;

    // 1. Paginate the raw HTML into chunks.
    this.contentChunks = this._paginateContent(
      this.mainContentHtml,
      contentW_px,
      contentH_px
    );

    // 2. Build the full HTML pages *only* for the visual preview.
    const constructedPages = this.contentChunks.map((chunk) =>
      this._buildPreviewPageHtml(chunk, pageW_mm, pageH_mm)
    );
    this.safePagesForPreview = constructedPages.map((p) =>
      this.sanitizer.bypassSecurityTrustHtml(p)
    );
  }

  private _paginateContent(
    html: string,
    widthPx: number,
    heightPx: number
  ): string[] {
    const chunks: string[] = [];
    const source = document.createElement('div');
    source.innerHTML = html;

    const measurementDiv = document.createElement('div');
    measurementDiv.style.width = `${widthPx}px`;
    measurementDiv.style.visibility = 'hidden';
    measurementDiv.style.position = 'absolute';
    measurementDiv.style.top = '-9999px';
    document.body.appendChild(measurementDiv);

    let currentPageNodes: Node[] = [];
    Array.from(source.childNodes).forEach((node) => {
      measurementDiv.innerHTML = '';
      currentPageNodes.forEach((n) =>
        measurementDiv.appendChild(n.cloneNode(true))
      );
      measurementDiv.appendChild(node.cloneNode(true));

      if (
        measurementDiv.offsetHeight > heightPx &&
        currentPageNodes.length > 0
      ) {
        const chunkContainer = document.createElement('div');
        currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
        chunks.push(chunkContainer.innerHTML);
        currentPageNodes = [node.cloneNode(true)];
      } else {
        currentPageNodes.push(node.cloneNode(true));
      }
    });

    if (currentPageNodes.length > 0) {
      const chunkContainer = document.createElement('div');
      currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
      chunks.push(chunkContainer.innerHTML);
    }

    document.body.removeChild(measurementDiv);
    return chunks;
  }

  private _buildPreviewPageHtml(
    contentChunk: string,
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
              ${contentChunk}
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

    // Loop through the pre-calculated content chunks.
    for (let i = 0; i < this.contentChunks.length; i++) {
      if (i > 0) {
        doc.addPage();
      }

      // Add the background image to the current page.
      if (this.backgroundImageSrc) {
        doc.addImage(this.backgroundImageSrc, 'PNG', 0, 0, pageW, pageH);
      }

      const chunk = this.contentChunks[i];

      // Render the content chunk for this page, positioned correctly.
      await doc.html(chunk, {
        autoPaging: false, // Turn off autoPaging completely.
        x: this.sideMarginMm,
        y: this.topMarginMm,
        width: contentW,
        windowWidth: 800,
      });
    }

    doc.save(this.options.filename || 'document.pdf');
  }
}
