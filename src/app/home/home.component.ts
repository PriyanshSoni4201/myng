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
  // We can now easily change the PDF format and the preview will adapt automatically.
  // Let's try a landscape 'letter' format.
  pdfOptions = {
    orientation: 'p', // 'p' for portrait, 'l' for landscape
    unit: 'mm',
    format: 'a4', // 'a4', 'letter', 'legal', etc.
    marginTop: 20,
    marginRight: 15,
    marginBottom: 20,
    marginLeft: 15,
    backgroundImageSrc: 'public/bg.png',
    filename: 'dynamic-letter-document.pdf',
  };

  // The content remains pure HTML, with no special wrappers.
  pdfContent: string = `
    <h1>Dynamic PDF Generation!</h1>
    <p>
      This preview is now in <b>'letter'</b> format and <b>landscape</b> orientation.
      The aspect ratio and margins are calculated dynamically from the options object.
    </p>
    <p>Here are some sample items:</p>
    <ul>
      <li>Item 1: Dynamic sizing</li>
      <li>Item 2: Reusable component</li>
      <li>Item 3: Clean HTML input</li>
    </ul>
    <h3>Longer Content to Test Scrolling</h3>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
  `;
}
