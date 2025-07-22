import { Component } from '@angular/core';
import { PdfGeneratorComponent } from '../pdf-generator/pdf-generator.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PdfGeneratorComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  pdfOptions = {
    unit: 'mm',
    format: 'a4',
    orientation: 'p',
    filename: 'Correct-Layout.pdf',
  };

  // Define the blank space at the top and bottom in millimeters.
  topMarginMm = 30;
  bottomMarginMm = 30;
  sideMarginMm = 20;

  backgroundImageSrc = 'public/bg.png';

  // We are removing the multi-page content for now to focus on a perfect single-page layout.
  mainContentHtml: string = `
    <h1>Native jsPDF Rendering with Selectable Text</h1>
    <p>This PDF is generated using jsPDF's native HTML renderer. The text you see here is fully selectable and searchable in the final document.</p>
    
    <h2>Feature List</h2>
    <ul>
      <li>Selectable and searchable text.</li>
      <li>Layout is controlled by a background image and defined blank margins.</li>
      <li>Content now correctly uses the full width of the page.</li>
    </ul>
    

    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  `;
}