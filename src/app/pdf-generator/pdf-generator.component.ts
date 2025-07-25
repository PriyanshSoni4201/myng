import {
  Component,
  Input,
  Output, // Import Output
  EventEmitter, // Import EventEmitter
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

  // Emits the new HTML content when the editor saves a change.
  @Output() contentChange = new EventEmitter<string>();

  private constructedPages: string[] = [];
  protected safePages: SafeHtml[] = [];

  // State for the editor
  protected isEditing = false;
  protected editingContent = '';
  // Store the ID of the element being edited for reliability.
  private activeEditTargetId: string | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * BUG FIX: This now correctly re-renders the preview whenever the
   * mainContentHtml input changes. The old logic was blocking updates.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mainContentHtml']) {
      this.constructPages();
    }
  }

  /**
   * When a user double-clicks, we find the element, get its unique ID,
   * and open the editor with its content.
   */
  protected handleDblClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const elementToEdit = target.closest('.pdf-content-area > *[id]');

    if (elementToEdit) {
      this.activeEditTargetId = elementToEdit.id;
      this.editingContent = elementToEdit.innerHTML;
      this.isEditing = true;
    }
  }

  /**
   * When the editor saves, we find the element by its ID in a temporary
   * copy of the HTML, update it, and emit the full new HTML string
   * back to the parent component.
   */
  protected handleSave(newContent: string): void {
    if (!this.activeEditTargetId) return;

    // Create a temporary, non-rendered element to safely manipulate the HTML
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = this.mainContentHtml;

    // Find the element to update using its unique ID
    const elementToUpdate = tempContainer.querySelector(
      `#${this.activeEditTargetId}`
    );

    if (elementToUpdate) {
      elementToUpdate.innerHTML = newContent;
      // Emit the full, updated HTML string to the parent component.
      this.contentChange.emit(tempContainer.innerHTML);
    }

    this.handleCancel(); // Close the editor
  }

  protected handleCancel(): void {
    this.isEditing = false;
    this.activeEditTargetId = null;
    this.editingContent = '';
  }

  // No changes needed for the methods below
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
      if (i > 0) {
        doc.addPage();
      }

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
