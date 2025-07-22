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
  protected safePages: SafeHtml[] = [];

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

    const contentChunks = this._paginateContent(
      this.mainContentHtml,
      contentW_px,
      contentH_px
    );

    this.constructedPages = contentChunks.map((chunk) =>
      this._buildPreviewPageHtml(chunk, pageW_mm, pageH_mm)
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

  private _buildPreviewPageHtml(
    contentChunk: string,
    widthMm: number,
    heightMm: number
  ): string {
    const contentWidthMm = widthMm - this.sideMarginMm * 2;
    const temporaryStyles = 'border: 1px solid black; box-sizing: border-box;';

    return `
      <div class="pdf-page-container" style="width: ${widthMm}mm; height: ${heightMm}mm;">
        <img class="pdf-background-image" src="${this.backgroundImageSrc}" />
        <div class="pdf-content-wrapper" style="display: flex; flex-direction: column; height: 100%;">
            <div class="pdf-spacer-top" style="height: ${this.topMarginMm}mm; flex-shrink: 0; ${temporaryStyles}"></div>
            <div class="pdf-content-area" style="width: ${contentWidthMm}mm; margin: 0 ${this.sideMarginMm}mm; flex-grow: 1; overflow: hidden;">
              ${contentChunk}
            </div>
            <div class="pdf-spacer-bottom" style="height: ${this.bottomMarginMm}mm; flex-shrink: 0; ${temporaryStyles}"></div>
        </div>
      </div>
    `;
  }

  public async downloadPdf(): Promise<void> {
    const doc = new jsPDF(this.options);
    const pageW_mm = doc.internal.pageSize.getWidth();

    const inchesPerMm = 1 / 25.4;
    const ppi = 96;
    const windowWidthInPixels = pageW_mm * inchesPerMm * ppi;

    for (let i = 0; i < this.constructedPages.length; i++) {
      if (i > 0) {
        doc.addPage();
      }

      const pageHtml = this.constructedPages[i];

      // ** THE DEBUGGING STEP IS HERE **
      // This will log the HTML for each page before it's rendered.
      console.log(`--- HTML for PDF Page ${i + 1} ---`);
      console.log(pageHtml);

      await doc.html(pageHtml, {
        autoPaging: false,
        x: 0,
        y: 0,
        width: pageW_mm,
        windowWidth: windowWidthInPixels,
      });
    }

    doc.save(this.options.filename || 'document.pdf');
  }
}
