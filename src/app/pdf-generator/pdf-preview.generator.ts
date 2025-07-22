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
import html2canvas from 'html2canvas';

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

  protected pages: SafeHtml[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['backgroundImageSrc'] || changes['mainContentHtml']) {
      this.constructPages();
    }
  }

  private async constructPages(): Promise<void> {
    const tempDoc = new jsPDF(this.options);
    const pageW_mm = tempDoc.internal.pageSize.getWidth();
    const pageH_mm = tempDoc.internal.pageSize.getHeight();
    const margins = this.options.margins || { top: 0, right: 0, bottom: 0, left: 0 };
    
    const previewWidthPx = 700; 
    const pxPerMm = previewWidthPx / pageW_mm;

    const contentW_px = (pageW_mm - margins.left - margins.right) * pxPerMm;
    const contentH_px = (pageH_mm - margins.top - margins.bottom) * pxPerMm;

    const contentChunks = this._paginateContent(this.mainContentHtml, contentW_px, contentH_px);
    const constructedPageHtml = contentChunks.map(chunk => 
      this._buildPageHtml(chunk, pageW_mm * pxPerMm, pageH_mm * pxPerMm, margins, pxPerMm)
    );
    this.pages = constructedPageHtml.map(p => this.sanitizer.bypassSecurityTrustHtml(p));
  }

  private _paginateContent(html: string, widthPx: number, heightPx: number): string[] {
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
    Array.from(source.childNodes).forEach(node => {
      measurementDiv.innerHTML = '';
      currentPageNodes.forEach(n => measurementDiv.appendChild(n.cloneNode(true)));
      measurementDiv.appendChild(node.cloneNode(true));

      if (measurementDiv.offsetHeight > heightPx && currentPageNodes.length > 0) {
        const chunkContainer = document.createElement('div');
        currentPageNodes.forEach(n => chunkContainer.appendChild(n));
        chunks.push(chunkContainer.innerHTML);
        currentPageNodes = [node.cloneNode(true)];
      } else {
        currentPageNodes.push(node.cloneNode(true));
      }
    });

    if (currentPageNodes.length > 0) {
      const chunkContainer = document.createElement('div');
      currentPageNodes.forEach(n => chunkContainer.appendChild(n));
      chunks.push(chunkContainer.innerHTML);
    }
    
    document.body.removeChild(measurementDiv);
    return chunks;
  }

  private _buildPageHtml(contentChunk: string, widthPx: number, heightPx: number, marginsMm: any, pxPerMm: number): string {
    const topPx = marginsMm.top * pxPerMm;
    const rightPx = marginsMm.right * pxPerMm;
    const bottomPx = marginsMm.bottom * pxPerMm;
    const leftPx = marginsMm.left * pxPerMm;

    // This creates a full-page div with the background, and an inner div for content with padding.
    return `
      <div class="pdf-page" style="width: ${widthPx}px; height: ${heightPx}px; background-image: url(${this.backgroundImageSrc});">
        <div class="pdf-content" style="padding: ${topPx}px ${rightPx}px ${bottomPx}px ${leftPx}px;">
          ${contentChunk}
        </div>
      </div>
    `;
  }

  public async downloadPdf(): Promise<void> {
    const doc = new jsPDF(this.options);
    const pageW_mm = doc.internal.pageSize.getWidth();
    const pageH_mm = doc.internal.pageSize.getHeight();
    
    const renderContainer = document.createElement('div');
    renderContainer.style.position = 'absolute';
    renderContainer.style.left = '-9999px';
    document.body.appendChild(renderContainer);

    for (let i = 0; i < this.pages.length; i++) {
      if (i > 0) doc.addPage();
      
      const pageHtml = this.sanitizer.sanitize(1, this.pages[i]) || '';
      renderContainer.innerHTML = pageHtml;
      const pageElement = renderContainer.firstElementChild as HTMLElement;

      const canvas = await html2canvas(pageElement, { useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      
      doc.addImage(imgData, 'PNG', 0, 0, pageW_mm, pageH_mm);
    }

    document.body.removeChild(renderContainer);
    doc.save(this.options.filename || 'document.pdf');
  }
}