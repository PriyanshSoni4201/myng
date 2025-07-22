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
  @Input() backgroundImageSrc: string = '';
  @Input() mainContentHtml: string = '';
  @Input() topMarginMm: number = 0;
  @Input() bottomMarginMm: number = 0;
  @Input() sideMarginMm: number = 0;

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
      // Avoid re-paginating if the change came from the editor itself
      return;
    }
    this.constructPages();
  }

  protected handleDblClick(event: MouseEvent, pageIndex: number): void {
    const target = event.target as HTMLElement;

    // Find the direct child of the content area that was clicked
    const elementToEdit = target.closest('.pdf-content-area > *');

    if (elementToEdit) {
      // Edit existing element
      this.activeEditTarget = { type: 'edit', element: elementToEdit };
      this.editingContent = elementToEdit.innerHTML;
      this.isEditing = true;
    } else if (target.closest('.pdf-content-area')) {
      // Insert new element
      this.activeEditTarget = { type: 'insert', element: target };
      this.editingContent = ''; // Start with an empty editor
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

    // Reconstruct the mainContentHtml from the live DOM
    previewPages.forEach((page) => {
      fullHtml += (page as HTMLElement).innerHTML;
    });

    this.mainContentHtml = fullHtml;
    this.constructPages(); // Re-paginate and render
    this.handleCancel(); // Close the editor
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
