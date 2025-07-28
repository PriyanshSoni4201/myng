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
    filename: 'Medical-Report-Reusable.pdf',
  };

  sideMarginMm = 10;
  headerHeight = 35;
  footerHeight = 30;

  headerHtml = `
    <div style="width: 100%; height: 100%;">
      <img src="header.jpg" alt="Report Header" style="width: 100%; height: 100%;">
    </div>
  `;

  footerHtml = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; align-items: center; box-sizing: border-box; border-top: 1px solid #eee;">
      <div style="font-family: sans-serif; font-size: 10px; color: #555; text-align: center; padding-top: 2mm;">
        Page {{PAGE_NUMBER}} of {{TOTAL_PAGES}}
      </div>
      <div style="width: 100%; height: 20mm; text-align: center;">
        <img src="footer.jpg" alt="Footer Logo" style="width: 100%; height: 100%;">
      </div>
    </div>
  `;

  // NEW: Define the HTML for the reusable patient data card.
  // This code is a direct translation of the image you provided.
  patientCardHtml = `
    <div style="font-family: sans-serif; font-size: 11px; margin-top: 5px;">
        <div style="width: 100%; text-align: center; margin-bottom: 5px;">
            <div style="font-weight: bold; font-size: 14px; padding-bottom: 5px;">
                CARDIOLOGY SUBSEQUENT CONSULTATION
            </div>
        </div>
        <div style="background-color: #e0e0e0; border-top: 1px solid #777; border-bottom: 1px solid #777; padding: 2px 4px; display: flex; justify-content: space-between; font-weight: bold;">
            <span>Aaradhana Rajeshwaran Balasubramanian (F / 35Y 10M)</span>
            <span>25-Jun-2025 | 18:15</span>
        </div>
        <div style="display: flex; background-color: #e0e0e0;">
            <div style="width: 50%; padding: 5px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <tr><td style="font-weight: bold; padding: 1px 2px; width: 100px;">UHID</td><td style="padding: 1px 2px;">13121200000030</td></tr>
                    <tr><td style="font-weight: bold; padding: 1px 2px;">Encounter No.</td><td style="padding: 1px 2px;">RFT-20250618-0423</td></tr>
                    <tr><td style="font-weight: bold; padding: 1px 2px;">Address</td><td style="padding: 1px 2px;">Malad East, Mumbai</td></tr>
                    <tr><td style="font-weight: bold; padding: 1px 2px;">Diagnosis</td><td style="padding: 1px 2px;">Hypertension & Diabetes</td></tr>
                </table>
            </div>
            <div style="width: 1px; background-color: #b0b0b0;"></div>
            <div style="width: 50%; padding: 5px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <tr><td style="font-weight: bold; padding: 1px 2px; width: 80px;">Consultant</td><td style="padding: 1px 2px;">Dr. Abhinav Vapte MD DM</td></tr>
                    <tr><td style="font-weight: bold; padding: 1px 2px;">Ref. By</td><td style="padding: 1px 2px;">Dr. Anita Sharma</td></tr>
                    <tr><td style="font-weight: bold; padding: 1px 2px;">Payer Class</td><td style="padding: 1px 2px;">Self</td></tr>
                </table>
            </div>
        </div>
    </div>
  `;

  // Use the placeholder div to insert the card wherever needed.
  mainContentHtml: string = `
    <!-- Insert the reusable patient card here -->
    <div class="insert-patient-card"></div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Brief Patient History</div>
        <div style="font-family: sans-serif; font-size: 11px; margin-top: 3px;">Suffered with diabetes</div>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Chief Complaints</div>
        <!-- table content... -->
    </div>

    <div class="pdf-page-break"></div>

    <!-- The patient card can be reused on a new page -->
    <div class="insert-patient-card"></div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">ODP/HPI</div>
        <!-- table content... -->
    </div>
  `;
}
