import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: Correct the import name here if it was also misspelled
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { HtmlGeneratorService } from '../services/html-generator.service';
import { PdfService } from '../services/pdf.service';

@Component({
  selector: 'app-pdf-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css'],
})
export class PdfPreviewComponent implements OnInit {
  private finalReportHtml: string = '';
  public safeHtmlForPreview: SafeHtml = '';
  public isLoading = true;

  constructor(
    // FIX: Correct the spelling from 'DomSanititizer' to 'DomSanitizer'
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private htmlGenerator: HtmlGeneratorService,
    private pdfService: PdfService
  ) {}

  ngOnInit(): void {
    this.http.get<any>('assets/data/report.json').subscribe((reportData) => {
      const data = reportData.pdfData || reportData;

      let allContentItems: any[] = [];
      if (data.contentMaster && Array.isArray(data.contentMaster.sections)) {
        data.contentMaster.sections.forEach((section: any, index: number) => {
          if (Array.isArray(section.contentItems)) {
            if (index > 0) {
              allContentItems.push({ contentType: 'PageBreak' });
            }
            allContentItems = allContentItems.concat(section.contentItems);
          }
        });
      }

      if (data.signatureFooter) {
        allContentItems.push({
          contentType: 'Signature',
          tableData: data.signatureFooter,
        });
      }

      const unpaginatedBody =
        this.htmlGenerator.generateUnpaginatedBodyHtml(allContentItems);

      const contentChunks = this._paginateContentUsingDom(unpaginatedBody);

      this.finalReportHtml = this.htmlGenerator.generatePaginatedReportHtml(
        data,
        contentChunks
      );

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
      if (element.classList.contains('pdf-page-break')) {
        if (currentPageNodes.length > 0) {
          const chunkContainer = document.createElement('div');
          currentPageNodes.forEach((n) => chunkContainer.appendChild(n));
          chunks.push(chunkContainer.innerHTML);
        }
        currentPageNodes = [];
        return;
      }

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
