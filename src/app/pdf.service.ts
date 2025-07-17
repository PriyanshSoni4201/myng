import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  // Helper function to load an image from a URL (like our local asset path)
  // and return a promise that resolves with the HTMLImageElement.
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

  public async generatePdf(htmlContent: string, options: any): Promise<Blob> {
    // Load the background image *before* doing anything else.
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
        // We can decide to continue without a background or throw an error
        // For now, we'll continue without it.
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

      // Override the addPage method to apply the background on every new page.
      const originalAddPage = (doc as any).addPage;
      (doc as any).addPage = (...args: any[]) => {
        originalAddPage.apply(doc, args);
        addBackgroundImageToPage();
        return doc;
      };

      // Apply background to the first page.
      addBackgroundImageToPage();

      // Prepare and render the HTML content.
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '210mm';
      tempDiv.innerHTML = htmlContent;
      document.body.appendChild(tempDiv);

      doc.html(tempDiv, {
        x: options.marginLeft,
        y: options.marginTop,
        width: pdfPageWidth - options.marginLeft - options.marginRight,
        windowWidth: 1000,
        autoPaging: 'text',
        callback: (finalDoc) => {
          document.body.removeChild(tempDiv);

          // Restore the original addPage function to prevent side effects.
          (finalDoc as any).addPage = originalAddPage;

          resolve(finalDoc.output('blob'));
        },
      });
    });
  }
}
