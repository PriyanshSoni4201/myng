import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HtmlGeneratorService } from '../services/html-generator.service';
import { PdfService } from '../services/pdf.service';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [PdfService, HtmlGeneratorService], 
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css'],
})
export class PdfPreviewComponent implements OnInit {
  private finalReportHtml: string = '';
  public safeHtmlForPreview: SafeHtml = '';
  public isLoading = true;

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private htmlGenerator: HtmlGeneratorService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.http.get<any>('assets/data/report.json').subscribe((reportData) => {
      // Step 1: Generate the unpaginated body content to be measured.
      const unpaginatedBody = this.htmlGenerator.generateUnpaginatedBodyHtml(
        reportData.contentMaster.contentItems
      );

      // Step 2: Perform the pagination measurement. This MUST happen here
      // because it needs access to the browser's DOM.
      const contentChunks = this._paginateContentUsingDom(unpaginatedBody);

      // Step 3: Call the generator service to build the final, complete HTML document.
      this.finalReportHtml = this.htmlGenerator.generatePaginatedReportHtml(
        reportData,
        contentChunks
      );

      // Step 4: Display the result.
      this.safeHtmlForPreview = this.sanitizer.bypassSecurityTrustHtml(
        this.finalReportHtml
      );

      this.isLoading = false;
    });
  }

  public downloadWithJsPDF(): void {
    this.pdfService.generatePdfClientSide(this.finalReportHtml);
  }

  public downloadWithServer(): void {
    this.pdfService.generatePdfServerSide(this.finalReportHtml);
  }

  private _paginateContentUsingDom(html: string): string[] {
    const PREVIEW_WIDTH_PX = 700;
    const PAGE_W_MM = 210;
    const HEADER_H_MM = 35;
    const FOOTER_H_MM = 30;
    const SIDE_MARGIN_MM = 10;
    const PAGE_H_MM = 297;

    const pxPerMm = PREVIEW_WIDTH_PX / PAGE_W_MM;
    const contentW_px = (PAGE_W_MM - SIDE_MARGIN_MM * 2) * pxPerMm;
    const contentH_px = (PAGE_H_MM - HEADER_H_MM - FOOTER_H_MM) * pxPerMm;

    const chunks: string[] = [];
    const source = document.createElement('div');
    source.innerHTML = html;

    const measurementDiv = document.createElement('div');
    measurementDiv.style.width = `${contentW_px}px`;
    measurementDiv.style.visibility = 'hidden';
    measurementDiv.style.position = 'absolute';
    measurementDiv.style.top = '-9999px';
    document.body.appendChild(measurementDiv);

    let currentPageNodes: Node[] = [];
    Array.from(source.children).forEach((element: Element) => {
      measurementDiv.innerHTML = '';
      currentPageNodes.forEach((n) =>
        measurementDiv.appendChild(n.cloneNode(true))
      );
      measurementDiv.appendChild(element.cloneNode(true));

      if (
        measurementDiv.offsetHeight > contentH_px &&
        currentPageNodes.length > 0
      ) {
        const chunkContainer = document.createElement('div');
        currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
        chunks.push(chunkContainer.innerHTML);
        currentPageNodes = [element.cloneNode(true)];
      } else {
        currentPageNodes.push(element.cloneNode(true));
      }
    });

    if (currentPageNodes.length > 0) {
      const chunkContainer = document.createElement('div');
      currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
      chunks.push(chunkContainer.innerHTML);
    }

    document.body.removeChild(measurementDiv);
    return chunks;
  }
}
