import { Component } from '@angular/core';
import { PdfGeneratorComponent } from '../pdf-generator/pdf-generator.component';
// EditorComponent is no longer needed here as it's used by the child component.

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PdfGeneratorComponent], // Corrected imports array
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  // Define the physical properties of the PDF document.
  pdfOptions = {
    unit: 'mm',
    format: 'a4',
    orientation: 'p',
    filename: 'Final-Document.pdf',
  };

  // Define the blank space at the top, bottom, and sides in millimeters.
  topMarginMm = 30;
  bottomMarginMm = 30;
  sideMarginMm = 20;

  // Provide the image source for the page background.
  backgroundImageSrc = 'public/bg.png';

  // Provide the raw HTML content that needs to be paginated.
  // A border has been added to each element to make them easy to see and double-click.
  mainContentHtml: string = `
    <h1 style="border: 1px solid #ddd; padding: 5px;">Native jsPDF Rendering with Selectable Text</h1>
    <p style="border: 1px solid #ddd; padding: 5px;">This PDF is generated using jsPDF's native HTML renderer. The text you see here is fully selectable and searchable in the final document.</p>
    
    <h2 style="border: 1px solid #ddd; padding: 5px;">Feature List</h2>
    <ul style="border: 1px solid #ddd; padding: 20px;">
      <li>Selectable and searchable text.</li>
      <li>Pagination is controlled by pre-calculating content height.</li>
      <li>Layout is controlled by a background image and defined blank margins.</li>
    </ul>

    <p style="border: 1px solid #ddd; padding: 5px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p style="border: 1px solid #ddd; padding: 5px;">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <p style="border: 1px solid #ddd; padding: 5px;">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    
    <h2 style="border: 1px solid #ddd; padding: 5px;">This Header Will Be on Page 2</h2>
    <p style="border: 1px solid #ddd; padding: 5px;">The component's pagination logic measures the content above and correctly places this section onto the second page, respecting the defined top and bottom blank spaces.</p>
    <p style="border: 1px solid #ddd; padding: 5px;">Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
  `;
}
