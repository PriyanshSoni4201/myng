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
  // Define the physical properties of the PDF document.
  pdfOptions = {
    unit: 'mm',
    format: 'a4',
    orientation: 'p',
    filename: 'Medical-Report.pdf',
  };

  // Define the blank space at the top, bottom, and sides in millimeters as requested.
  topMarginMm = 30;
  bottomMarginMm = 10;
  sideMarginMm = 10;

  // Provide the image source for the page background.
  backgroundImageSrc = 'public/bg.png';

  // Provide the raw HTML content that needs to be paginated.
  // The content is structured as a series of independent elements (h2, table, h3)
  // to allow the pagination logic to split them correctly.
  mainContentHtml: string = `<div style="font-family: sans-serif; font-size: 10px; color: #000000; width: 700px; margin: 10px;">

<div style="border-bottom: 1px solid #000000; padding-bottom: 5px; margin-bottom: 12px;">  <!-- Adjusted margin-bottom -->
    <div style="font-weight: bold; font-size: 12px;">CARDIOLOGY SUBSEQUENT CONSULTATION</div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
            <div style="font-weight: bold;">Aaradhana Rajeshwaran Balasubramanian (F / 35Y 10M)</div>
            <div>UHID: 13121200000030</div>
            <div>Encounter No.: RFT-20250618-0423</div>
            <div>Address: Malad East, Mumbai</div>
            <div>Diagnosis: Hypertension & Diabetes</div>
        </div>
        <div>
            <div>25-Jun-2025 | 18:15</div>
            <div>Consultant: Dr. Abhinav Vapte MD DM</div>
            <div>Ref. By: Dr. Anita Sharma</div>
            <div>Payer Class: Self</div>
            <img src="public/qr.png" alt="QR Code" style="width: 50px; height: 50px;">
        </div>
    </div>
</div>

<div style="margin-bottom: 10px;">
    <div style="font-weight: bold;">Brief Patient History</div>
    <div>Suffered with diabetes</div>
</div>

<div style="height: 6px; background-color: #f0f0f0;"></div> <!-- Adjusted height -->

<div style="margin-bottom: 10px;">
    <div style="font-weight: bold;">Chief Complaints</div>
    <table style="width: 100%; border-collapse: collapse;">
        <thead style="border-bottom: 1px solid #000000;">
            <tr>
                <th style="text-align: left; padding: 3px 5px;">No.</th>
                <th style="text-align: left; padding: 3px 5px;">Chief Complaint</th>
                <th style="text-align: left; padding: 3px 5px;">Duration</th>
                <th style="text-align: left; padding: 3px 5px;">Remarks</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 3px 5px;">1</td>
                <td style="padding: 3px 5px;">Gastrointestinal<br>Neuroendocrine Tumors</td>
                <td style="padding: 3px 5px;">5 Days</td>
                <td style="padding: 3px 5px;">The patient reports experiencing a high fever of 101.5°F, accompanied by significant chills, overwhelming fatigue, and a persistent cough.</td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">2</td>
                <td style="padding: 3px 5px;">Cough</td>
                <td style="padding: 3px 5px;">3 Days</td>
                <td style="padding: 3px 5px;">The patient reports experiencing chills and profound fatigue. Additionally, they describe occasional chest pain that feels sharp and intensifies with deep breaths.</td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">3</td>
                <td style="padding: 3px 5px;">Chest Pain</td>
                <td style="padding: 3px 5px;">12 Days</td>
                <td style="padding: 3px 5px;">The patient is showing signs of chills and notable fatigue. They also mention a dry cough that is persistent and irritating, causing discomfort in the throat and occasionally leading to shortness of breath.</td>
            </tr>
        </tbody>
    </table>
</div>

<div style="height: 6px; background-color: #f0f0f0;"></div> <!-- Adjusted height -->

<div style="margin-bottom: 10px;">
    <div style="font-weight: bold;">ODP/HPI</div>
    <table style="width: 100%; border-collapse: collapse;">
        <thead style="border-bottom: 1px solid #000000;">
            <tr>
                <th style="text-align: left; padding: 3px 5px;">No.</th>
                <th style="text-align: left; padding: 3px 5px;">Date</th>
                <th style="text-align: left; padding: 3px 5px;">Remarks</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 3px 5px;">1</td>
                <td style="padding: 3px 5px;">24-Dec-2003</td>
                <td style="padding: 3px 5px;">Chest pain began approximately 1 hour ago while at rest, squeezing or pressure in the chest which radiates down the left arm. History of hypertension & high cholesterol. No known allergies. Sedentary lifestyle, moderate alcohol consumption.</td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">2</td>
                <td style="padding: 3px 5px;">24-Dec-2003</td>
                <td style="padding: 3px 5px;">Chest pain began approximately 1 hour ago while at rest, squeezing or pressure in the chest which radiates down the left arm. History of hypertension & high cholesterol. No known allergies. Sedentary lifestyle, moderate alcohol consumption.</td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">3</td>
                <td style="padding: 3px 5px;">04-Jan-2006</td>
                <td style="padding: 3px 5px;">Chest pain began approximately 1 hour ago while at rest, squeezing or pressure in the chest which radiates down the left arm. History of hypertension & high cholesterol. No known allergies. Sedentary lifestyle, moderate alcohol consumption.</td>
            </tr>
        </tbody>
    </table>
</div>

<div style="height: 6px; background-color: #f0f0f0;"></div> <!-- Adjusted height -->

<div style="margin-bottom: 10px;">
    <div style="font-weight: bold;">Past Medical History</div>
    <table style="width: 100%; border-collapse: collapse;">
        <thead style="border-bottom: 1px solid #000000;">
            <tr>
                <th style="text-align: left; padding: 3px 5px;">No.</th>
                <th style="text-align: left; padding: 3px 5px;">Disease</th>
                <th style="text-align: left; padding: 3px 5px;">Onset Date</th>
                <th style="text-align: left; padding: 3px 5px;">Remarks</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 3px 5px;">1</td>
                <td style="padding: 3px 5px;">Diabetes</td>
                <td style="padding: 3px 5px;">24 Dec 2003</td>
                <td style="padding: 3px 5px;">Uses Pump</td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">2</td>
                <td style="padding: 3px 5px;">Asthama</td>
                <td style="padding: 3px 5px;">22 Dec 2003</td>
                <td style="padding: 3px 5px;">Occasional Spasms</td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">3</td>
                <td style="padding: 3px 5px;">Diabetes</td>
                <td style="padding: 3px 5px;">14 Mar 2003</td>
                <td style="padding: 3px 5px;">Uses Pump</td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">4</td>
                <td style="padding: 3px 5px;">Asthama</td>
                <td style="padding: 3px 5px;">17 Dec 2003</td>
                <td style="padding: 3px 5px;">Occasional Spasms</td>
            </tr>
        </tbody>
    </table>
</div>

<div style="height: 6px; background-color: #f0f0f0;"></div> <!-- Adjusted height -->

<div style="margin-bottom: 10px;">
    <div style="font-weight: bold;">Hospitalization & Surgical History</div>
    <table style="width: 100%; border-collapse: collapse;">
        <thead style="border-bottom: 1px solid #000000;">
            <tr>
                <th style="text-align: left; padding: 3px 5px;">No.</th>
                <th style="text-align: left; padding: 3px 5px;">Diagnosis</th>
                <th style="text-align: left; padding: 3px 5px;">Diagnosis ICD Code</th>
                <th style="text-align: left; padding: 3px 5px;">Treatment</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 3px 5px;">1</td>
                <td style="padding: 3px 5px;">Heart Failure, Chest Pain</td>
                <td style="padding: 3px 5px;">12C65</td>
                <td style="padding: 3px 5px;">Heart Transplant</td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">Care Professional<br>Dr. Aarti Mehta</td>
                <td style="padding: 3px 5px;">Care Provider<br>Apollo Hospital</td>
                <td style="padding: 3px 5px;">DOA<br>24-Feb-2007</td>
                <td style="padding: 3px 5px;"></td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">DOD<br>04-Mar-2007</td>
                <td style="padding: 3px 5px;">Procedure<br>Bypass</td>
                <td style="padding: 3px 5px;">Procedure ICD Code<br>12C65</td>
                <td style="padding: 3px 5px;"></td>
            </tr>
            <tr>
                <td style="padding: 3px 5px;">Surgeon<br>Dr. Aarti Mehta</td>
                <td style="padding: 3px 5px;">Date of Surgery<br>28-Feb-2007</td>
                <td style="padding: 3px 5px;">Remarks<br>Operation successful</td>
                <td style="padding: 3px 5px;"></td>
            </tr>
        </tbody>
    </table>
</div>

<div style="height: 6px; background-color: #f0f0f0;"></div> <!-- Adjusted height -->

<div style="border-top: 1px solid #000000; padding-top: 5px; display: flex; justify-content: space-between; align-items: center;">
    <div>18 Mar 2025 | 15:04</div>
    <div>Dr. Shantanu Wankhede</div>
    <div>Page 1 of 6</div>
</div>


</div>`;
}