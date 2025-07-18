// pdf.service.ts
import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
// Note: This service uses jspdf's built-in .html() method,
// which internally handles rendering HTML to canvas, but you
// do not directly import or use 'html2canvas' in this service code.

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  /**
   * Loads an image and returns a Promise that resolves with the HTMLImageElement.
   * Useful for loading background images before PDF generation.
   * @param src The source URL of the image.
   * @returns A Promise that resolves with the loaded HTMLImageElement.
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Essential for loading images from different origins
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  }

  /**
   * Generates a PDF from HTML content with specified options.
   * It supports adding a background image to each page.
   *
   * @param htmlContent The HTML string to be converted to PDF.
   * @param options An object containing PDF generation options:
   * - `orientation`: 'p' (portrait) or 'l' (landscape).
   * - `unit`: Unit for measurements (e.g., 'mm', 'pt', 'in').
   * - `format`: Page format (e.g., 'a4', 'letter').
   * - `marginTop`, `marginRight`, `marginBottom`, `marginLeft`: Page margins in specified `unit`.
   * - `backgroundImageSrc`: (Optional) URL of an image to be used as a background on every page.
   * @returns A Promise that resolves with a Blob representing the generated PDF.
   */
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
        // Optionally, decide if you want to throw the error or proceed without background
        // For now, it will proceed without the background image if loading fails.
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
            'PNG', // or 'JPEG', based on your image type
            0,
            0,
            pdfPageWidth,
            pdfPageHeight,
            undefined,
            'FAST' // Provides a faster rendering quality for images
          );
        }
      };

      // Override jsPDF's addPage to automatically add a background image to new pages
      // This ensures the background appears on all pages, including those created by auto-paging.
      const originalAddPage = (doc as any).addPage; // Store original for later restoration
      (doc as any).addPage = (...args: any[]) => {
        originalAddPage.apply(doc, args); // Call the original addPage method
        addBackgroundImageToPage(); // Add background to the newly created page
        return doc; // Return doc for chaining
      };

      // Add background image to the very first page
      addBackgroundImageToPage();

      // Use jsPDF's .html() method to convert the HTML string to PDF.
      // This method handles the rendering internally without explicit direct 'html2canvas' calls in your code.
      doc.html(htmlContent, {
        margin: [
          options.marginTop,
          options.marginRight,
          options.marginBottom,
          options.marginLeft,
        ],
        autoPaging: 'text', // Controls how content flows across pages. 'text' tries to break intelligently.
        width: pdfPageWidth - options.marginLeft - options.marginRight, // Content width within the PDF page
        windowWidth: 1000, // Important for how jsPDF interprets CSS and layout during HTML rendering
        callback: (finalDoc) => {
          // Restore the original addPage function to the document object
          // This prevents potential side effects if the 'doc' object were to be reused.
          (finalDoc as any).addPage = originalAddPage;
          resolve(finalDoc.output('blob')); // Resolve the Promise with the PDF Blob
        },
      });
    });
  }
}
