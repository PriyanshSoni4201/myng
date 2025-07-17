import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

  // New pre-processing function to handle atomic blocks
  private preventBreaks(
    container: HTMLDivElement,
    pageContentHeightPx: number
  ): void {
    const elements = container.querySelectorAll<HTMLElement>(
      '.jspdf-prevent-break'
    );
    // We iterate backwards because modifying the DOM by adding spacers
    // would change the `offsetTop` of subsequent elements.
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const offsetTop = el.offsetTop;
      const offsetHeight = el.offsetHeight;

      // Calculate which page the element starts and ends on
      const startPage = Math.floor(offsetTop / pageContentHeightPx);
      const endPage = Math.floor(
        (offsetTop + offsetHeight) / pageContentHeightPx
      );

      // If the element crosses a page boundary
      if (startPage !== endPage) {
        // Calculate the height of the empty space needed to push the element to the next page
        const currentPageTop = startPage * pageContentHeightPx;
        const spaceNeeded = pageContentHeightPx - (offsetTop - currentPageTop);

        // Create and insert the spacer element
        const spacer = document.createElement('div');
        spacer.style.height = `${spaceNeeded}px`;
        el.parentNode?.insertBefore(spacer, el);
      }
    }
  }

  public async generatePdf(htmlContent: string, options: any): Promise<Blob> {
    let backgroundImage: HTMLImageElement | null = null;
    if (options.backgroundImageSrc) {
      try {
        backgroundImage = await this.loadImage(options.backgroundImageSrc);
      } catch (error) {
        console.error(
          'Failed to load background image:',
          options.backgroundImageSrc,
          error
        );
      }
    }

    return new Promise((resolve) => {
      const doc = new jsPDF({
        orientation: options.orientation,
        unit: options.unit,
        format: options.format,
      });

      const pdfPageWidth = doc.internal.pageSize.getWidth();
      const pdfPageHeight = doc.internal.pageSize.getHeight();

      const addBackgroundImageToPage = () => {
        if (backgroundImage) {
          doc.addImage(
            backgroundImage,
            'PNG',
            0,
            0,
            pdfPageWidth,
            pdfPageHeight,
            undefined,
            'FAST'
          );
        }
      };

      const originalAddPage = (doc as any).addPage;
      (doc as any).addPage = (...args: any[]) => {
        originalAddPage.apply(doc, args);
        addBackgroundImageToPage();
        return doc;
      };

      addBackgroundImageToPage();

      const tempDiv = document.createElement('div');
      tempDiv.style.width = '210mm';
      tempDiv.style.wordWrap = 'break-word';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      // PRE-PROCESSING STEP
      const mmToPxFactor = 3.7795275591; // A common conversion factor
      const pageContentHeightPx =
        (pdfPageHeight - options.marginTop - options.marginBottom) *
        mmToPxFactor;
      this.preventBreaks(tempDiv, pageContentHeightPx);

      doc.html(tempDiv, {
        margin: [
          options.marginTop,
          options.marginRight,
          options.marginBottom,
          options.marginLeft,
        ],
        autoPaging: 'text',
        width: pdfPageWidth - options.marginLeft - options.marginRight,
        windowWidth: 1000,
        callback: (finalDoc) => {
          document.body.removeChild(tempDiv);
          (finalDoc as any).addPage = originalAddPage;
          resolve(finalDoc.output('blob'));
        },
      });
    });
  }
}
