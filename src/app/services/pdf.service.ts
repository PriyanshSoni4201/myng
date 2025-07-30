// src/app/services/pdf.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private serverUrl = 'http://localhost:3000/api/generate-pdf';

  constructor(private http: HttpClient) {}

  public async generatePdfClientSide(
    pages: string[],
    windowWidth: number,
    filename: string = 'report-jspdf.pdf'
  ): Promise<void> {
    const pdfOptions = { unit: 'mm', format: 'a4', orientation: 'p' } as const;
    const doc = new jsPDF(pdfOptions);
    const pageW_mm = doc.internal.pageSize.getWidth();

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) doc.addPage();
      await doc.html(pages[i], {
        autoPaging: false,
        x: 0,
        y: 0,
        width: pageW_mm,
        windowWidth: windowWidth,
      });
    }

    if (pages.length > 0) doc.deletePage(1);
    doc.save(filename);
  }

  public generatePdfServerSide(
    finalHtml: string,
    filename: string = 'report-server.pdf'
  ): void {
    this.http
      .post(this.serverUrl, { html: finalHtml }, { responseType: 'blob' })
      .subscribe({
        next: (blob) => saveAs(blob, filename),
        error: (err) => {
          console.error('Error from Puppeteer server:', err);
          alert('Failed to generate PDF from server.');
        },
      });
  }
}
