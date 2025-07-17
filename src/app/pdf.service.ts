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
      // Allow cross-origin images for reliability, especially with services like Imgur
      img.crossOrigin = 'Anonymous';
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
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
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      doc.html(tempDiv, {
        // THIS IS THE CRITICAL CHANGE:
        // We use the 'margin' option to enforce it on ALL pages.
        // We no longer use 'x' and 'y' which only apply to the first page.
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
