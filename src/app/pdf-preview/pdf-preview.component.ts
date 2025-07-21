import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  SecurityContext,
  ViewEncapsulation,
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
  encapsulation: ViewEncapsulation.None,
})
export class PdfGeneratorComponent implements OnChanges {
  @Input() contentHtml: string = '<p>No content provided.</p>';
  @Input() options: any = { format: 'a4' };

  protected paginatedHtml: SafeHtml[] = [];
  protected previewStyles: { [key: string]: string } = {};

  constructor(
    private pdfService: PdfService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contentHtml'] || changes['options']) {
      this.generatePaginatedPreview();
    }
  }

  public downloadPdf(): void {
    this.pdfService.generatePdf(this.contentHtml, this.options);
  }

  private generatePaginatedPreview(): void {
    const tempDoc = new jsPDF(this.options);
    const pageW_mm = tempDoc.internal.pageSize.getWidth();
    const pageH_mm = tempDoc.internal.pageSize.getHeight();
    const displayWidthPx = 700; // The fixed width of our preview container in the browser

    // The scale factor from the options, essential for matching jsPDF's rendering
    const scale = this.options.html2canvas?.scale || 0.26;

    // Calculate the pixel dimensions of the HTML content as jsPDF will render it
    const contentWidth_mm =
      pageW_mm -
      (this.options.marginLeft || 0) -
      (this.options.marginRight || 0);
    const contentHeight_mm =
      pageH_mm -
      (this.options.marginTop || 0) -
      (this.options.marginBottom || 0);

    const sourceWidthPx = contentWidth_mm / scale;
    const sourceHeightPx = contentHeight_mm / scale;

    this.previewStyles = {
      '--page-aspect-ratio': `${pageW_mm} / ${pageH_mm}`,
      '--page-bg-image': `url('${this.options.backgroundImageSrc || ''}')`,
      // Calculate padding for the visual preview based on its display width
      '--page-padding-top': `${
        ((this.options.marginTop || 0) / pageW_mm) * displayWidthPx
      }px`,
      '--page-padding-right': `${
        ((this.options.marginRight || 0) / pageW_mm) * displayWidthPx
      }px`,
      '--page-padding-bottom': `${
        ((this.options.marginBottom || 0) / pageW_mm) * displayWidthPx
      }px`,
      '--page-padding-left': `${
        ((this.options.marginLeft || 0) / pageW_mm) * displayWidthPx
      }px`,
    };

    this.paginatedHtml = this.paginateHtml(
      this.contentHtml,
      sourceHeightPx,
      sourceWidthPx
    );
  }

  private paginateHtml(
    html: string,
    pageHeightPx: number,
    pageWidthPx: number
  ): SafeHtml[] {
    const pages: string[] = [];
    const source = document.createElement('div');
    source.innerHTML = html;

    const measurementDiv = document.createElement('div');
    measurementDiv.style.width = `${pageWidthPx}px`;
    measurementDiv.style.visibility = 'hidden';
    measurementDiv.style.position = 'absolute';
    measurementDiv.style.top = '-9999px';
    document.body.appendChild(measurementDiv);

    let currentPageNodes: Node[] = [];
    let currentHeight = 0;

    Array.from(source.childNodes).forEach((node) => {
      measurementDiv.appendChild(node.cloneNode(true));
      const nodeHeight = measurementDiv.offsetHeight;
      measurementDiv.innerHTML = ''; // Clear after measuring

      if (
        currentHeight + nodeHeight > pageHeightPx &&
        currentPageNodes.length > 0
      ) {
        // Node overflows, so finalize the current page
        const pageContainer = document.createElement('div');
        currentPageNodes.forEach((n) => pageContainer.appendChild(n));
        pages.push(pageContainer.innerHTML);

        // Start a new page with the current node
        currentPageNodes = [node.cloneNode(true)];
        measurementDiv.appendChild(node.cloneNode(true));
        currentHeight = measurementDiv.offsetHeight;
        measurementDiv.innerHTML = '';
      } else {
        // Node fits, add it to the current page
        currentPageNodes.push(node.cloneNode(true));
        currentHeight += nodeHeight;
      }
    });

    // Add the last page if it has content
    if (currentPageNodes.length > 0) {
      const pageContainer = document.createElement('div');
      currentPageNodes.forEach((n) => pageContainer.appendChild(n));
      pages.push(pageContainer.innerHTML);
    }

    document.body.removeChild(measurementDiv);
    return pages.map((pageHtml) =>
      this.sanitizer.bypassSecurityTrustHtml(pageHtml)
    );
  }
}
