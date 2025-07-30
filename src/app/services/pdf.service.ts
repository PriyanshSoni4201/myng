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
    finalHtml: string,
    filename: string = 'report-jspdf.pdf'
  ): Promise<void> {
    const pdfOptions = { unit: 'mm', format: 'a4', orientation: 'p' } as const;
    const doc = new jsPDF(pdfOptions);
    const pageW_mm = doc.internal.pageSize.getWidth();

    // Parse the final HTML to get individual pages
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(finalHtml, 'text/html');
    const pageElements = htmlDoc.querySelectorAll('.page-container');

    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) doc.addPage();
      await doc.html(pageElements[i] as HTMLElement, {
        autoPaging: false,
        x: 0,
        y: 0,
        width: pageW_mm,
        windowWidth: 700, // A fixed window width for consistent scaling
      });
    }

    if (pageElements.length > 0) doc.deletePage(1); // jsPDF adds a blank first page
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
