import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor() {}

  generatePdf(htmlContent: string, options: any = {}): Promise<Blob> {
    return new Promise(async (resolve) => {
      const {
        orientation = 'p',
        unit = 'mm',
        format = 'a4',
        marginTop = 10,
        marginBottom = 10,
        marginLeft = 10,
        marginRight = 10,
        backgroundImageSrc = null,
      } = options;

      const doc = new jsPDF({
        orientation,
        unit,
        format,
      });

      const pdfPageWidth = doc.internal.pageSize.getWidth();
      const pdfPageHeight = doc.internal.pageSize.getHeight();

      if (backgroundImageSrc) {
        try {
          doc.addImage(
            backgroundImageSrc,
            'PNG',
            0,
            0,
            pdfPageWidth,
            pdfPageHeight
          );
        } catch (e) {
          console.error('Error adding background image:', e);
        }
      }

      const pdfContentWidth = pdfPageWidth - (marginLeft + marginRight);

      const dpi = 96;
      const mmToPxFactor = dpi / 25.4;

      const htmlRenderWidthPx = Math.floor(pdfContentWidth * mmToPxFactor);
      const htmlRenderMinHeightPx = Math.floor(
        (pdfPageHeight - (marginTop + marginBottom)) * mmToPxFactor
      );

      const tempDiv = document.createElement('div');
      tempDiv.style.width = `${htmlRenderWidthPx}px`;
      tempDiv.style.minHeight = `${htmlRenderMinHeightPx}px`;
      tempDiv.style.boxSizing = 'border-box';
      tempDiv.style.padding = '0px';
      tempDiv.style.margin = '0px';
      tempDiv.innerHTML = htmlContent;

      document.body.appendChild(tempDiv);

      doc.html(tempDiv, {
        x: marginLeft,
        y: marginTop,
        width: pdfContentWidth,
        windowWidth: htmlRenderWidthPx,
        autoPaging: 'text',
        callback: function (pdf) {
          document.body.removeChild(tempDiv);
          resolve(pdf.output('blob'));
        },
      });
    });
  }
}
