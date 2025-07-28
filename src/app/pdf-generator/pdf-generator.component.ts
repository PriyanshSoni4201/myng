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
  @Input() headerHtml: string = '';
  @Input() footerHtml: string = '';
  @Input() headerHeightMm: number = 35;
  @Input() footerHeightMm: number = 30;
  @Input() mainContentHtml: string = '';

  // NEW: Input to receive the reusable HTML template from the parent
  @Input() patientCardHtml: string = '';

  private constructedPages: string[] = [];
  protected safePages: SafeHtml[] = [];

  // State for the editor
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

  // No changes needed for editor handling or other methods...
  protected handleDblClick(event: MouseEvent, pageIndex: number): void {
    const target = event.target as HTMLElement;
    const elementToEdit = target.closest('.pdf-content-area > *');
    if (
      elementToEdit &&
      !elementToEdit.classList.contains('pdf-page-break-handle')
    ) {
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
    const contentH_px =
      (pageH_mm - this.headerHeightMm - this.footerHeightMm) * pxPerMm;

    const contentChunks = this._paginateContent(
      this.mainContentHtml,
      contentW_px,
      contentH_px
    );

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

  // --- MODIFIED PAGINATION LOGIC WITH REUSABLE COMPONENT ---
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
      let elementToAdd = element;

      // NEW: Check for the reusable patient card placeholder
      if (element.classList.contains('insert-patient-card')) {
        // Create a new div and inject the patient card HTML into it
        const cardContainer = document.createElement('div');
        cardContainer.innerHTML = this.patientCardHtml;
        // The element we will process for pagination is now this new container
        elementToAdd = cardContainer;
      }

      // Check for the manual page-break element
      if (element.classList.contains('pdf-page-break')) {
        if (currentPageNodes.length > 0) {
          const chunkContainer = document.createElement('div');
          currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
          chunks.push(chunkContainer.innerHTML);
        }
        currentPageNodes = [];
        return; // Skip to the next element
      }

      // --- Original pagination logic using the (potentially replaced) elementToAdd ---
      measurementDiv.innerHTML = '';
      currentPageNodes.forEach((n) =>
        measurementDiv.appendChild(n.cloneNode(true))
      );
      measurementDiv.appendChild(elementToAdd.cloneNode(true));

      if (
        measurementDiv.offsetHeight > heightPx &&
        currentPageNodes.length > 0
      ) {
        const chunkContainer = document.createElement('div');
        currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
        chunks.push(chunkContainer.innerHTML);
        currentPageNodes = [elementToAdd.cloneNode(true)];
      } else {
        currentPageNodes.push(elementToAdd.cloneNode(true));
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
    heightMm: number,
    pageNumber: number,
    totalPages: number
  ): string {
    const processedFooter = this.footerHtml
      .replace(/{{PAGE_NUMBER}}/g, pageNumber.toString())
      .replace(/{{TOTAL_PAGES}}/g, totalPages.toString());

    return `
      <div class="pdf-page-container" style="width: ${widthMm}mm; height: ${heightMm}mm;">
        <div class="pdf-header" style="height: ${this.headerHeightMm}mm; padding: 0 ${this.sideMarginMm}mm;">
          ${this.headerHtml}
        </div>
        <div class="pdf-content-area" style="padding: 0 ${this.sideMarginMm}mm;">
          ${contentChunk}
        </div>
        <div class="pdf-footer" style="height: ${this.footerHeightMm}mm; padding: 0 ${this.sideMarginMm}mm;">
          ${processedFooter}
        </div>
      </div>
    `;
  }

  public async downloadPdf(): Promise<void> {
    const doc = new jsPDF(this.options);
    const pageW_mm = doc.internal.pageSize.getWidth();
    const windowWidthInPixels = pageW_mm * (96 / 25.4);
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
    doc.deletePage(1);
    doc.save(this.options.filename || 'document.pdf');
  }
}
