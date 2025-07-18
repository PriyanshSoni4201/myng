// pdf.service.ts
import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
// Ensure the html plugin is correctly loaded/imported if you're using modular jspdf setup

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

  /**
   * Generates a PDF from HTML content with specified options and directly triggers the download.
   * This method handles all asynchronous operations and the file download internally.
   *
   * @param htmlContent The HTML string to be converted to PDF.
   * @param options An object containing PDF generation options:
   * - `orientation`: 'p' (portrait) or 'l' (landscape).
   * - `unit`: Unit for measurements (e.g., 'mm', 'pt', 'in').
   * - `format`: Page format (e.g., 'a4', 'letter').
   * - `marginTop`, `marginRight`, `marginBottom`, `marginLeft`: Page margins in specified `unit`.
   * - `backgroundImageSrc`: (Optional) URL of an image to be used as a background on every page.
   * - `filename`: The desired filename for the downloaded PDF (e.g., 'my_document.pdf').
   * @returns void (the download is a side effect)
   */
  public async generatePdf(htmlContent: string, options: any): Promise<void> {
    // <--- Method name reverted here!
    let backgroundImage: HTMLImageElement | null = null;
    if (options.backgroundImageSrc) {
      try {
        backgroundImage = await this.loadImage(options.backgroundImageSrc);
      } catch (error) {
        console.error(
          'Service: Failed to load background image:',
          options.backgroundImageSrc,
          error
        );
      }
    }

    return new Promise<void>((resolve, reject) => {
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

      doc.html(htmlContent, {
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
          (finalDoc as any).addPage = originalAddPage;

          try {
            const pdfBlob: Blob = finalDoc.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = options.filename || 'document.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve();
          } catch (downloadError) {
            console.error('Service: PDF download failed:', downloadError);
            reject(downloadError);
          }
        },
      });
    });
  }
}
