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

      // Function to add background image to the current page
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

      // Override jsPDF's addPage to automatically add background image to new pages
      const originalAddPage = (doc as any).addPage;
      (doc as any).addPage = (...args: any[]) => {
        originalAddPage.apply(doc, args);
        addBackgroundImageToPage(); // Add background to the newly created page
        return doc;
      };

      // Add background image to the first page initially
      addBackgroundImageToPage();

      // Render the HTML content directly without creating a temporary div in the DOM
      doc.html(htmlContent, {
        margin: [
          options.marginTop,
          options.marginRight,
          options.marginBottom,
          options.marginLeft,
        ],
        autoPaging: 'text', // Continue to use auto-paging for text
        width: pdfPageWidth - options.marginLeft - options.marginRight,
        windowWidth: 1000, // Important for how jsPDF interprets CSS/layout
        callback: (finalDoc) => {
          // Restore original addPage function to avoid side effects if doc object is reused
          (finalDoc as any).addPage = originalAddPage;
          resolve(finalDoc.output('blob'));
        },
      });
    });
  }
}
