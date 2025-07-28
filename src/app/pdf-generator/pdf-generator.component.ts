// pdf-generator.component.ts

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
import { EditorComponent } from '../editor/editor.component';

@Component({
  selector: 'app-pdf-generator',
  standalone: true,
  imports: [CommonModule, EditorComponent],
  templateUrl: './pdf-generator.component.html',
  styleUrls: ['./pdf-generator.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class PdfGeneratorComponent implements OnChanges {
  @Input() options: any = { unit: 'mm', format: 'a4' };
  @Input() sideMarginMm: number = 0;

  // NEW: Inputs for header and footer
  @Input() headerHtml: string = '';
  @Input() footerHtml: string = '';
  @Input() headerHeightMm: number = 35; // As requested
  @Input() footerHeightMm: number = 30; // As requested

  // The main content that will be paginated
  @Input() mainContentHtml: string = '';

  private constructedPages: string[] = [];
  protected safePages: SafeHtml[] = [];

  // State for the editor (no changes needed here)
  protected isEditing = false;
  protected editingContent = '';
  private activeEditTarget: {
    type: 'edit' | 'insert';
    element: Element;
  } | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['mainContentHtml'] &&
      !changes['mainContentHtml'].isFirstChange()
    ) {
      return;
    }
    this.constructPages();
  }

  // No changes needed for the editor handling methods (handleDblClick, handleSave, handleCancel)
  protected handleDblClick(event: MouseEvent, pageIndex: number): void {
    const target = event.target as HTMLElement;
    const elementToEdit = target.closest('.pdf-content-area > *');

    if (elementToEdit) {
      this.activeEditTarget = { type: 'edit', element: elementToEdit };
      this.editingContent = elementToEdit.innerHTML;
      this.isEditing = true;
    } else if (target.closest('.pdf-content-area')) {
      this.activeEditTarget = { type: 'insert', element: target };
      this.editingContent = '';
      this.isEditing = true;
    }
  }

  protected handleSave(newContent: string): void {
    if (!this.activeEditTarget) return;
    const previewPages = document.querySelectorAll(
      '.preview-page-wrapper .pdf-content-area'
    );
    let fullHtml = '';
    if (this.activeEditTarget.type === 'edit') {
      this.activeEditTarget.element.innerHTML = newContent;
    } else if (this.activeEditTarget.type === 'insert') {
      const newElement = document.createElement('p');
      newElement.innerHTML = newContent;
      this.activeEditTarget.element.appendChild(newElement);
    }
    previewPages.forEach((page) => {
      fullHtml += (page as HTMLElement).innerHTML;
    });
    this.mainContentHtml = fullHtml;
    this.constructPages();
    this.handleCancel();
  }

  protected handleCancel(): void {
    this.isEditing = false;
    this.activeEditTarget = null;
    this.editingContent = '';
  }

  private constructPages(): void {
    const tempDoc = new jsPDF(this.options);
    const pageW_mm = tempDoc.internal.pageSize.getWidth();
    const pageH_mm = tempDoc.internal.pageSize.getHeight();

    const previewWidthPx = 700;
    const pxPerMm = previewWidthPx / pageW_mm;
    const contentW_px = (pageW_mm - this.sideMarginMm * 2) * pxPerMm;

    // UPDATED: Calculate content height based on header and footer sizes
    const contentH_px =
      (pageH_mm - this.headerHeightMm - this.footerHeightMm) * pxPerMm;

    const contentChunks = this._paginateContent(
      this.mainContentHtml,
      contentW_px,
      contentH_px
    );

    // UPDATED: Pass the page number to the build function
    this.constructedPages = contentChunks.map((chunk, index) => {
      const pageNumber = index + 1;
      const totalPages = contentChunks.length;
      return this._buildPageHtml(
        chunk,
        pageW_mm,
        pageH_mm,
        pageNumber,
        totalPages
      );
    });

    this.safePages = this.constructedPages.map((p) =>
      this.sanitizer.bypassSecurityTrustHtml(p)
    );
  }

  // The pagination logic itself doesn't need to change, as it correctly uses the calculated height
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
    Array.from(source.children).forEach((element: Element) => {
      measurementDiv.innerHTML = '';
      currentPageNodes.forEach((n) =>
        measurementDiv.appendChild(n.cloneNode(true))
      );
      measurementDiv.appendChild(element.cloneNode(true));

      if (
        measurementDiv.offsetHeight > heightPx &&
        currentPageNodes.length > 0
      ) {
        const chunkContainer = document.createElement('div');
        currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
        chunks.push(chunkContainer.innerHTML);
        currentPageNodes = [element.cloneNode(true)];
      } else {
        currentPageNodes.push(element.cloneNode(true));
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

  // REWRITTEN: This function now builds the page with a dedicated header, content, and footer
  private _buildPageHtml(
    contentChunk: string,
    widthMm: number,
    heightMm: number,
    pageNumber: number,
    totalPages: number
  ): string {
    const contentWidthMm = widthMm - this.sideMarginMm * 2;

    // Replace placeholders in the footer
    const processedFooter = this.footerHtml
      .replace(/{{PAGE_NUMBER}}/g, pageNumber.toString())
      .replace(/{{TOTAL_PAGES}}/g, totalPages.toString());

    return `
      <div class="pdf-page-container" style="width: ${widthMm}mm; height: ${heightMm}mm;">
        <!-- Header Section -->
        <div class="pdf-header" style="height: ${this.headerHeightMm}mm; padding: 0 ${this.sideMarginMm}mm;">
          ${this.headerHtml}
        </div>

        <!-- Content Section (the "working space") -->
        <div class="pdf-content-area" style="padding: 0 ${this.sideMarginMm}mm;">
          ${contentChunk}
        </div>

        <!-- Footer Section -->
        <div class="pdf-footer" style="height: ${this.footerHeightMm}mm; padding: 0 ${this.sideMarginMm}mm;">
          ${processedFooter}
        </div>
      </div>
    `;
  }

  // No changes needed for downloadPdf
  public async downloadPdf(): Promise<void> {
    const doc = new jsPDF(this.options);
    const pageW_mm = doc.internal.pageSize.getWidth();
    const windowWidthInPixels = pageW_mm * (96 / 25.4); // 96 DPI is a common screen resolution

    for (let i = 0; i < this.constructedPages.length; i++) {
      if (i > 0) doc.addPage();
      const pageHtml = this.constructedPages[i];
      await doc.html(pageHtml, {
        autoPaging: false,
        x: 0,
        y: 0,
        width: pageW_mm,
        windowWidth: windowWidthInPixels,
      });
    }

    doc.deletePage(1); // jsPDF adds a blank first page by default
    doc.save(this.options.filename || 'document.pdf');
  }
}
