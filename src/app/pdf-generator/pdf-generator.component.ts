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

  private constructedPages: string[] = [];
  // This property now correctly holds the sanitized HTML for the template.
  protected safePages: SafeHtml[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    // We only need to reconstruct the pages if the input data changes.
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

    const contentChunks = this._paginateContent(
      this.mainContentHtml,
      contentW_px,
      contentH_px
    );

    this.constructedPages = contentChunks.map((chunk) =>
      this._buildPageHtml(chunk, pageW_mm, pageH_mm)
    );
    this.safePages = this.constructedPages.map((p) =>
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

  private _buildPageHtml(
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

    for (let i = 0; i < this.constructedPages.length; i++) {
      if (i > 0) {
        doc.addPage();
      }
      const pageHtml = this.constructedPages[i];

      // We pass the *entire constructed page* to the html method.
      // This lets jsPDF handle the layering of text on top of the image.
      await doc.html(pageHtml, {
        autoPaging: false,
        width: pageW,
        windowWidth: 1000,
        x: 0,
        y: 0,
      });
    }

    doc.save(this.options.filename || 'document.pdf');
  }
}
