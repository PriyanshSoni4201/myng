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

  public async generatePdf(htmlContent: string, options: any): Promise<void> {
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
      const doc = new jsPDF(options);

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
        html2canvas: options.html2canvas,
        callback: (finalDoc) => {
          (finalDoc as any).addPage = originalAddPage;

          // This block handles the immediate download.
          try {
            // 1. Generate the PDF as a 'blob' (a file-like object in the browser's memory).
            const pdfBlob: Blob = finalDoc.output('blob');

            // 2. Create a temporary, local URL for this in-memory file.
            const url = URL.createObjectURL(pdfBlob);

            // 3. Create a temporary, invisible link element.
            const a = document.createElement('a');
            a.href = url;

            // 4. THIS IS THE KEY: The 'download' attribute tells the browser to download
            // the file instead of navigating to the URL. We give it the desired filename.
            a.download = options.filename || 'document.pdf';

            // 5. Add the link to the document and programmatically click it.
            document.body.appendChild(a);
            a.click();

            // 6. Clean up by removing the temporary link and URL from memory.
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
