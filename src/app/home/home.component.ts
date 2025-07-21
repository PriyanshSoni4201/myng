import { Component } from '@angular/core';
import { PdfGeneratorComponent } from '../pdf-preview/pdf-preview.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PdfGeneratorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  pdfOptions = {
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    // We adjust the top margin to make space for the header in the background image.
    marginTop: 60, // Increased top margin
    marginRight: 15,
    // We adjust the bottom margin to make space for the footer.
    marginBottom: 25, // Increased bottom margin
    marginLeft: 15,
    backgroundImageSrc: 'public/bg.png', // This will be the page template
    filename: 'wysiwyg-document.pdf',
    html2canvas: {
      scale: 0.26,
    },
  };

  // --- CORRECTED HTML CONTENT ---
  // The <img> tag pointing to the background has been removed.
  // This string now ONLY contains the content that should appear INSIDE the page.
  pdfContent: string = `
    <h1>WYSIWYG PDF Generation!</h1>
    <p>This preview now accurately reflects the pagination of the final PDF. Content that flows beyond the boundary of one page will automatically be shifted to the next, just as it will in the downloaded file.</p>
    <h2>Feature List</h2>
    <ul>
      <li>Accurate page-break simulation.</li>
      <li>Each simulated page has its own background.</li>
      <li>Dynamic calculation based on format and margins.</li>
      <li>Final PDF uses the same source HTML.</li>
    </ul>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <h2>This Header Will Be on Page 2</h2>
    <p>This is the first paragraph on the second page. The pagination logic calculates the height of the preceding elements and determines that this content must start on a new page.</p>
  `;
}
