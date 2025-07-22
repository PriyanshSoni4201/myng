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
    filename: 'Correctly-Paginated-Document.pdf',
  };

  topMarginMm = 30;
  bottomMarginMm = 30;
  sideMarginMm = 20;

  backgroundImageSrc = 'public/bg.png';

  // Added enough content to ensure it spans multiple pages.
  mainContentHtml: string = `
    <h1>Native jsPDF Rendering with Selectable Text</h1>
    <p>This PDF is generated using jsPDF's native HTML renderer. The text you see here is fully selectable and searchable in the final document.</p>
    
    <h2>Feature List</h2>
    <ul>
      <li>Selectable and searchable text.</li>
      <li>Pagination is controlled by pre-calculating content height.</li>
      <li>Layout is controlled by a background image and defined blank margins.</li>
    </ul>

    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    
    <h2>This Header Will Be on Page 2</h2>
    <p>The component's pagination logic measures the content above and correctly places this section onto the second page, respecting the defined top and bottom blank spaces.</p>
    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
    <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
    
    <h2>This Should Be on Page 3</h2>
    <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>
    <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?</p>
  `;
}
