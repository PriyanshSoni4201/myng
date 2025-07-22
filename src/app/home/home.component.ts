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
    filename: 'Medical-Report-Final-Grouped.pdf',
  };

  // Define the blank space at the top, bottom, and sides in millimeters.
  topMarginMm = 33;
  bottomMarginMm = 15;
  sideMarginMm = 10;

  // Provide the image source for the page background.
  backgroundImageSrc = 'public/bg.png'; // Make sure this path is correct.

  // This is the HTML block that needs to be repeated on every page.
  repeatingHeaderHtml = `
    <div>
        <div style="width: 100%; text-align: center;">
            <div style="font-family: sans-serif; font-weight: bold; font-size: 14px; padding-bottom: 5px;">
                CARDIOLOGY SUBSEQUENT CONSULTATION
            </div>
        </div>
        <div style="font-family: sans-serif; font-size: 11px; background-color: #e0e0e0; border-top: 1px solid #777; border-bottom: 1px solid #777; padding: 2px 4px;">
            <div style="display: inline-block; width: 60%; font-weight: bold;">
                <img src="public/user-icon.png" alt="icon" style="height: 12px; width: 12px; vertical-align: middle; margin-right: 5px;">Aaradhana Rajeshwaran Balasubramanian (F / 35Y 10M)
            </div>
            <div style="display: inline-block; width: 39%; text-align: right; font-weight: bold;">
                25-Jun-2025 | 18:15
            </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; background-color: #e0e0e0;">
            <tbody>
                <tr>
                    <td style="width: 50%; vertical-align: top; padding: 5px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                            <tr><td style="font-weight: bold; padding: 1px 2px; width: 100px;">UHID</td><td style="padding: 1px 2px;">13121200000030</td></tr>
                            <tr><td style="font-weight: bold; padding: 1px 2px;">Encounter No.</td><td style="padding: 1px 2px;">RFT-20250618-0423</td></tr>
                            <tr><td style="font-weight: bold; padding: 1px 2px;">Address</td><td style="padding: 1px 2px;">Malad East, Mumbai</td></tr>
                            <tr><td style="font-weight: bold; padding: 1px 2px;">Diagnosis</td><td style="padding: 1px 2px;">Hypertension & Diabetes</td></tr>
                        </table>
                    </td>
                    <td style="width: 1px; background-color: #b0b0b0;"></td>
                    <td style="width: 49%; vertical-align: top; padding: 5px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                            <tr><td style="font-weight: bold; padding: 1px 2px; width: 80px;">Consultant</td><td style="padding: 1px 2px;">Dr. Abhinav Vapte MD DM</td></tr>
                            <tr><td style="font-weight: bold; padding: 1px 2px;">Ref. By</td><td style="padding: 1px 2px;">Dr. Anita Sharma</td></tr>
                            <tr><td style="font-weight: bold; padding: 1px 2px;">Payer Class</td><td style="padding: 1px 2px;">Self</td></tr>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  `;
  
  // Provide the raw HTML content, now structured in small groups with page break hints.
  mainContentHtml: string = `
    <!-- ========= PAGE 1 CONTENT START ========= -->
    ${this.repeatingHeaderHtml}

    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Brief Patient History</div>
      <div style="font-family: sans-serif; font-size: 11px; margin-top: 3px;">Suffered with diabetes</div>
    </div>

    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Chief Complaints</div>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 24%;">Chief Complaint</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 12%;">Duration</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
          <tbody>
              <tr><td style="padding: 2px; vertical-align: top;">1</td><td style="padding: 2px; vertical-align: top;">Gastrointestinal<br>Neuroendocrine Tumors</td><td style="padding: 2px; vertical-align: top;">5 Days</td><td style="padding: 2px; vertical-align: top;">The patient reports experiencing a high fever of 101.5°F, accompanied by significant chills, overwhelming fatigue, and a persistent cough.</td></tr>
              <tr><td style="padding: 2px; vertical-align: top;">2</td><td style="padding: 2px; vertical-align: top;">Cough</td><td style="padding: 2px; vertical-align: top;">3 Days</td><td style="padding: 2px; vertical-align: top;">The patient reports experiencing chills and profound fatigue. Additionally, they describe occasional chest pain that feels sharp and intensifies with deep breaths.</td></tr>
              <tr><td style="padding: 2px; vertical-align: top;">3</td><td style="padding: 2px; vertical-align: top;">Chest Pain</td><td style="padding: 2px; vertical-align: top;">12 Days</td><td style="padding: 2px; vertical-align: top;">The patient is showing signs of chills and notable fatigue. They also mention a dry cough that is persistent and irritating, causing discomfort in the throat and occasionally leading to shortness of breath.</td></tr>
          </tbody>
      </table>
    </div>

    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">ODP/HPI</div>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
        <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 15%;">Date</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
        <tbody>
            <tr><td style="padding: 2px; vertical-align: top;">1</td><td style="padding: 2px; vertical-align: top;">24-Dec-2003</td><td style="padding: 2px; vertical-align: top;">Chest pain began approximately 1 hour ago while at rest, squeezing or pressure in the chest which radiates down the left arm. History of hypertension & high cholesterol. No known allergies. Sedentary lifestyle, moderate alcohol consumption.</td></tr>
            <tr><td style="padding: 2px; vertical-align: top;">2</td><td style="padding: 2px; vertical-align: top;">24-Dec-2003</td><td style="padding: 2px; vertical-align: top;">Chest pain began approximately 1 hour ago while at rest, squeezing or pressure in the chest which radiates down the left arm. History of hypertension & high cholesterol. No known allergies. Sedentary lifestyle, moderate alcohol consumption.</td></tr>
            <tr><td style="padding: 2px; vertical-align: top;">3</td><td style="padding: 2px; vertical-align: top;">04-Jan-2006</td><td style="padding: 2px; vertical-align: top;">Chest pain began approximately 1 hour ago while at rest, squeezing or pressure in the chest which radiates down the left arm. History of hypertension & high cholesterol. No known allergies. Sedentary lifestyle, moderate alcohol consumption.</td></tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Past Medical History</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 24%;">Disease</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 20%;">Onset Date</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px;">1</td><td style="padding: 2px;">Diabetes</td><td style="padding: 2px;">24 Dec 2003</td><td style="padding: 2px;">Uses Pump</td></tr>
                <tr><td style="padding: 2px;">2</td><td style="padding: 2px;">Asthama</td><td style="padding: 2px;">22 Dec 2003</td><td style="padding: 2px;">Occasional Spasms</td></tr>
                <tr><td style="padding: 2px;">3</td><td style="padding: 2px;">Diabetes</td><td style="padding: 2px;">14 Mar 2003</td><td style="padding: 2px;">Uses Pump</td></tr>
                <tr><td style="padding: 2px;">4</td><td style="padding: 2px;">Asthama</td><td style="padding: 2px;">17 Dec 2003</td><td style="padding: 2px;">Occasional Spasms</td></tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Hospitalization & Surgical History</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <tbody>
                <tr><td style="padding: 2px; font-weight: bold; width: 25%;">No.</td><td style="padding: 2px;" colspan="5">1</td></tr>
                <tr><td style="padding: 2px; font-weight: bold;">Diagnosis</td><td style="padding: 2px;">Heart Failure, Chest Pain</td><td style="padding: 2px; font-weight: bold;">Diagnosis ICD Code</td><td style="padding: 2px;">12C65</td><td style="padding: 2px; font-weight: bold;">Treatment</td><td style="padding: 2px;">Heart Transplant</td></tr>
                <tr><td style="padding: 2px; font-weight: bold;">Care Professional</td><td style="padding: 2px;">Dr. Aarti Mehta</td><td style="padding: 2px; font-weight: bold;">Care Provider</td><td style="padding: 2px;">Apollo Hospital</td><td style="padding: 2px; font-weight: bold;">DOA</td><td style="padding: 2px;">24-Feb-2007</td></tr>
                <tr><td style="padding: 2px; font-weight: bold;">DOD</td><td style="padding: 2px;">04-Mar-2007</td><td style="padding: 2px; font-weight: bold;">Procedure</td><td style="padding: 2px;">Bypass</td><td style="padding: 2px; font-weight: bold;">Procedure ICD Code</td><td style="padding: 2px;">12C65</td></tr>
                <tr><td style="padding: 2px; font-weight: bold;">Surgeon</td><td style="padding: 2px;">Dr. Aarti Mehta</td><td style="padding: 2px; font-weight: bold;">Date of Surgery</td><td style="padding: 2px;">28-Feb-2007</td><td style="padding: 2px; font-weight: bold;">Remarks</td><td style="padding: 2px;">Operation successful</td></tr>
            </tbody>
        </table>
    </div>
    
    <!-- Page Break Hint for Page 1 -->
    <div style="height: 1px;"></div>

    <!-- ========= PAGE 2 CONTENT START ========= -->
    ${this.repeatingHeaderHtml}

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Lifestyle & Social History</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 24%;">Lifestyle</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 35%;">Parameters</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px;">1</td><td style="padding: 2px;">Diet</td><td style="padding: 2px;">Vegetariant</td><td style="padding: 2px;">Heart Transplant</td></tr>
                <tr><td style="padding: 2px;">2</td><td style="padding: 2px;">Diet</td><td style="padding: 2px;">Vegetariant</td><td style="padding: 2px;">Heart Transplant</td></tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Family History</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Relation</th><th style="text-align: left; padding: 2px; font-weight: bold;">Current Age</th><th style="text-align: left; padding: 2px; font-weight: bold;">Disease</th><th style="text-align: left; padding: 2px; font-weight: bold;">Onset Age</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px;">1</td><td style="padding: 2px;">Father</td><td style="padding: 2px;">40</td><td style="padding: 2px;">Diabetes</td><td style="padding: 2px;">30</td><td style="padding: 2px;">Artem Life Care</td></tr>
                <tr><td style="padding: 2px;">2</td><td style="padding: 2px;">Grandfather</td><td style="padding: 2px;">58</td><td style="padding: 2px;">Hypertension</td><td style="padding: 2px;">60</td><td style="padding: 2px;">Artem Life Care</td></tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Allergies & Hypersensitivity</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Allergy</th><th style="text-align: left; padding: 2px; font-weight: bold;">Allergen</th><th style="text-align: left; padding: 2px; font-weight: bold;">Type of Reaction</th><th style="text-align: left; padding: 2px; font-weight: bold;">Onset Date</th><th style="text-align: left; padding: 2px; font-weight: bold;">Severity</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px;">1</td><td style="padding: 2px;">Sulfa Drugs</td><td style="padding: 2px;">Sulfonamide</td><td style="padding: 2px;">Diabetes</td><td style="padding: 2px;">53</td><td style="padding: 2px;">Medium</td><td style="padding: 2px;">Artem Life Care</td></tr>
                <tr><td style="padding: 2px;">2</td><td style="padding: 2px;">Grandfather</td><td style="padding: 2px;">Sulfonamide</td><td style="padding: 2px;">Hypertension</td><td style="padding: 2px;">53</td><td style="padding: 2px;">Low</td><td style="padding: 2px;">Artem Life Care</td></tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Current Medications</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Medications</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px; vertical-align: top;">1</td><td style="padding: 2px; vertical-align: top;">Dolo 650 Paracetamol 1-1-1 times a day prescribed by Dr. Aditi Parekh since 5 Days Immediately after Meals</td></tr>
                <tr><td style="padding: 2px; vertical-align: top;">2</td><td style="padding: 2px; vertical-align: top;">Dolo 650 Paracetamol 1-0-1 times a day prescribed by Dr. Shantanu Wankhede since 5 Days Before Lunch & Dinner</td></tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Review of Systems</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Review of Systems</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px; vertical-align: top;">1</td><td style="padding: 2px; vertical-align: top;">Reports no fever, chills, night sweats, or weight loss. Reports no chest pain or shortness of breath. Reports no cough, sputum production, or wheezing. Experiences excessive thirst, frequent urination, and heat intolerance.</td></tr>
                <tr><td style="padding: 2px; vertical-align: top;">2</td><td style="padding: 2px; vertical-align: top;">Denies fever, chills, night sweats, weight loss. Denies chest pain, shortness of breath. Denies cough, sputum production, wheezing. Excessive thirst, frequent urination, or heat intolerance.</td></tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Previous Investigations</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 30%;">Investigation</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 30%;">Care Provider</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px;">1</td><td style="padding: 2px;">MRI of RT Thigh</td><td style="padding: 2px;">Artem Life Care</td><td style="padding: 2px;">Results were critical, reports are available</td></tr>
                <tr><td style="padding: 2px;">2</td><td style="padding: 2px;">Diet</td><td style="padding: 2px;">Vegetariant</td><td style="padding: 2px;">Heart Transplant</td></tr>
            </tbody>
        </table>
    </div>

    <!-- Page Break Hint for Page 2 -->
    <div style="height: 1px;"></div>

    <!-- ========= PAGE 3 CONTENT START ========= -->
    ${this.repeatingHeaderHtml}
    
    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Vitals</div>
        <table style="width: 100%; border-collapse: collapse; text-align: center; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="padding: 2px; font-weight: bold;">Pulse</th><th style="padding: 2px; font-weight: bold;">SBP</th><th style="padding: 2px; font-weight: bold;">DBP</th><th style="padding: 2px; font-weight: bold;">Temp</th><th style="padding: 2px; font-weight: bold;">RR</th><th style="padding: 2px; font-weight: bold;">SPO2</th><th style="padding: 2px; font-weight: bold;">Height</th><th style="padding: 2px; font-weight: bold;">Weight</th><th style="padding: 2px; font-weight: bold;">BMI</th><th style="padding: 2px; font-weight: bold;">PEFR</th><th style="padding: 2px; font-weight: bold;">RBS</th></tr></thead>
            <tbody><tr><td style="padding: 2px;">78 bpm</td><td style="padding: 2px;">45 mmHg</td><td style="padding: 2px;">70 mmHg</td><td style="padding: 2px;">36 °C</td><td style="padding: 2px;">18 bpm</td><td style="padding: 2px;">96 %</td><td style="padding: 2px;">174 cm</td><td style="padding: 2px;">54 kg</td><td style="padding: 2px;">18.3</td><td style="padding: 2px;">90</td><td style="padding: 2px;">78 mg</td></tr></tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">General Examination</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <tbody>
                <tr><td style="width: 25%; font-weight: bold; padding: 2px; vertical-align: top;">Level of Consciousness</td><td style="width: 25%; padding: 2px; vertical-align: top;">Alert</td><td style="width: 25%; font-weight: bold; padding: 2px; vertical-align: top;">Distress</td><td style="width: 25%; padding: 2px; vertical-align: top;">Chest Pain</td></tr>
                <tr><td style="font-weight: bold; padding: 2px; vertical-align: top;">Hygiene and Grooming</td><td style="padding: 2px; vertical-align: top;">Adequately Groomed</td><td style="font-weight: bold; padding: 2px; vertical-align: top;">Build and Nutrition</td><td style="padding: 2px; vertical-align: top;">Normal Build and Well-Nourished</td></tr>
                <tr><td style="font-weight: bold; padding: 2px; vertical-align: top;">Head & Face</td><td style="padding: 2px; vertical-align: top;">Normal shape, no swelling</td><td style="font-weight: bold; padding: 2px; vertical-align: top;">Facial Expression</td><td style="padding: 2px; vertical-align: top;">Anxiety</td></tr>
                <tr><td style="font-weight: bold; padding: 2px; vertical-align: top;">Eyes</td><td style="padding: 2px; vertical-align: top;">Clear, no redness</td><td style="font-weight: bold; padding: 2px; vertical-align: top;">Skin</td><td style="padding: 2px; vertical-align: top;">No rash or marks</td></tr>
                <tr><td style="font-weight: bold; padding: 2px; vertical-align: top;">Neck</td><td style="padding: 2px; vertical-align: top;">Normal, no swelling</td><td style="font-weight: bold; padding: 2px; vertical-align: top;">Lymph Nodes</td><td style="padding: 2px; vertical-align: top;">Not swollent</td></tr>
                <tr><td style="font-weight: bold; padding: 2px; vertical-align: top;">Mouth & Throat</td><td style="padding: 2px; vertical-align: top;">No sores, throat normal</td><td style="font-weight: bold; padding: 2px; vertical-align: top;">Mental Status and Behavior</td><td style="padding: 2px; vertical-align: top;">Calm and cooperative</td></tr>
                <tr><td style="font-weight: bold; padding: 2px; vertical-align: top;">Spine</td><td style="padding: 2px; vertical-align: top;">Straight, no pain</td><td style="font-weight: bold; padding: 2px; vertical-align: top;">Extremities</td><td style="padding: 2px; vertical-align: top;">No injuries</td></tr>
                <tr><td style="font-weight: bold; padding: 2px; vertical-align: top;">Extremities</td><td style="padding: 2px; vertical-align: top;">No swelling, normal</td><td></td><td></td></tr>
            </tbody>
        </table>
    </div>

    <!-- Page Break Hint for Page 3 -->
    <div style="height: 1px;"></div>

    <!-- ========= PAGE 4 CONTENT START ========= -->
    ${this.repeatingHeaderHtml}
    
    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Primary Diagnosis</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Type</th><th style="text-align: left; padding: 2px; font-weight: bold;">Diagnosis</th><th style="text-align: left; padding: 2px; font-weight: bold;">ICD 10 Code</th><th style="text-align: left; padding: 2px; font-weight: bold;">Onset Date</th><th style="text-align: left; padding: 2px; font-weight: bold;">Status</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody><tr><td style="padding: 2px;">1</td><td style="padding: 2px;">Final Diagnosis</td><td style="padding: 2px;">Diabetes Mellitus Type 2</td><td style="padding: 2px;">11.52.607</td><td style="padding: 2px;">22-Dec-2004</td><td style="padding: 2px;">Cured</td><td style="padding: 2px;">Artem Life Care</td></tr></tbody>
        </table>
    </div>
    
    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Secondary Diagnosis</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Type</th><th style="text-align: left; padding: 2px; font-weight: bold;">Diagnosis</th><th style="text-align: left; padding: 2px; font-weight: bold;">ICD 10 Code</th><th style="text-align: left; padding: 2px; font-weight: bold;">Onset Date</th><th style="text-align: left; padding: 2px; font-weight: bold;">Status</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody><tr><td style="padding: 2px;">1</td><td style="padding: 2px;">Final Diagnosis</td><td style="padding: 2px;">Diabetes Mellitus Type 2</td><td style="padding: 2px;">11.52.607</td><td style="padding: 2px;">22-Dec-2004</td><td style="padding: 2px;">Cured</td><td style="padding: 2px;">Artem Life Care</td></tr></tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Known Diagnosis (PMH)</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 6%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Type</th><th style="text-align: left; padding: 2px; font-weight: bold;">Diagnosis</th><th style="text-align: left; padding: 2px; font-weight: bold;">ICD 10 Code</th><th style="text-align: left; padding: 2px; font-weight: bold;">Onset Date</th><th style="text-align: left; padding: 2px; font-weight: bold;">Status</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody><tr><td style="padding: 2px;">1</td><td style="padding: 2px;">Final Diagnosis</td><td style="padding: 2px;">Diabetes Mellitus Type 2</td><td style="padding: 2px;">11.52.607</td><td style="padding: 2px;">22-Dec-2004</td><td style="padding: 2px;">Cured</td><td style="padding: 2px;">Artem Life Care</td></tr></tbody>
        </table>
    </div>

    <!-- Page Break Hint for Page 4 -->
    <div style="height: 1px;"></div>

    <!-- ========= PAGE 5 CONTENT START ========= -->
    ${this.repeatingHeaderHtml}

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Intermittent Medication</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 5%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Order</th><th style="text-align: left; padding: 2px; font-weight: bold;">Route</th><th style="text-align: left; padding: 2px; font-weight: bold;">Start Date | Time</th><th style="text-align: left; padding: 2px; font-weight: bold;">Frequency</th><th style="text-align: left; padding: 2px; font-weight: bold;">Dosage</th><th style="text-align: left; padding: 2px; font-weight: bold;">Dur.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Qty.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px; vertical-align: top;">1</td><td style="padding: 2px; vertical-align: top;">Echimococus<br>Granulosis IgG & IgM</td><td style="padding: 2px; vertical-align: top;">PO</td><td style="padding: 2px; vertical-align: top;">23-Apr-2025 | 12:09</td><td style="padding: 2px; vertical-align: top;">24hrs 10AM</td><td style="padding: 2px; vertical-align: top;">1-1-1</td><td style="padding: 2px; vertical-align: top;">99 D</td><td style="padding: 2px; vertical-align: top;">14</td><td style="padding: 2px; vertical-align: top;">Take after food</td></tr>
                <tr><td style="padding: 2px; vertical-align: top;">2</td><td style="padding: 2px; vertical-align: top;">Tab. DFL 6 mg<br>Deflazacort.</td><td style="padding: 2px; vertical-align: top;">Oral</td><td style="padding: 2px; vertical-align: top;">23-Apr-2025 | 12:09</td><td style="padding: 2px; vertical-align: top;">12hrs</td><td style="padding: 2px; vertical-align: top;">1-0-1</td><td style="padding: 2px; vertical-align: top;">111 D</td><td style="padding: 2px; vertical-align: top;">14</td><td style="padding: 2px; vertical-align: top;">Given as trial dose</td></tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Continuous Medication</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 5%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Order</th><th style="text-align: left; padding: 2px; font-weight: bold;">Start Date | Time</th><th style="text-align: left; padding: 2px; font-weight: bold;">Duration</th><th style="text-align: left; padding: 2px; font-weight: bold;">Infusion By</th><th style="text-align: left; padding: 2px; font-weight: bold;">Rate</th><th style="text-align: left; padding: 2px; font-weight: bold;">Qty.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Suggested Dose</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px;">1</td><td style="padding: 2px;">DOLONEX 40 MG INJ.</td><td style="padding: 2px;">23-Apr-2025 | 12:09</td><td style="padding: 2px;">99 D</td><td style="padding: 2px;">Syringe pump</td><td style="padding: 2px;">1 ml/min</td><td style="padding: 2px;">1 unit</td><td style="padding: 2px;">1 mcg/kg/min</td></tr>
                <tr><td style="padding: 2px;">2</td><td style="padding: 2px;">ZZ DEXREST TAB</td><td style="padding: 2px;">23-Apr-2025 | 12:09</td><td style="padding: 2px;">111 D</td><td style="padding: 2px;">Syringe pump</td><td style="padding: 2px;">1 ml/min</td><td style="padding: 2px;">1 unit</td><td style="padding: 2px;">1 mcg/kg/min</td></tr>
            </tbody>
        </table>
    </div>

    <div style="margin-top: 15px;">
        <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Services</div>
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
            <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 5%;">No.</th><th style="text-align: left; padding: 2px; font-weight: bold;">Order</th><th style="text-align: left; padding: 2px; font-weight: bold;">Date | Time</th><th style="text-align: left; padding: 2px; font-weight: bold;">Care Provider</th><th style="text-align: left; padding: 2px; font-weight: bold;">Department</th><th style="text-align: left; padding: 2px; font-weight: bold;">Dept. Head</th><th style="text-align: left; padding: 2px; font-weight: bold;">Indication</th></tr></thead>
            <tbody>
                <tr><td style="padding: 2px; vertical-align: top;">1</td><td style="padding: 2px; vertical-align: top;">Physicians<br>consultation</td><td style="padding: 2px; vertical-align: top;">23-Apr-2025 | 12:09</td><td style="padding: 2px; vertical-align: top;">Nair Hospital</td><td style="padding: 2px; vertical-align: top;">Pathology</td><td style="padding: 2px; vertical-align: top;">Dr. Samir S Nanavati</td><td style="padding: 2px; vertical-align: top;">General admission</td></tr>
                <tr><td style="padding: 2px;">2</td><td style="padding: 2px;">Oxygen</td><td style="padding: 2px;">23-Apr-2025 | 12:09</td><td style="padding: 2px;">Colaba</td><td style="padding: 2px;">Cardiology</td><td style="padding: 2px;">Dr. Deepak Vora</td><td style="padding: 2px;">General admission</td></tr>
            </tbody>
        </table>
    </div>

    <div style="text-align: right; margin-top: 20px; font-family: sans-serif; font-size: 11px;"><div style="display: inline-block; text-align: center; margin-right: 20px;"><div style="height: 20px;"></div><p style="margin: 0; padding-top: 2px; border-top: 1px solid #4a4a4a;">Dr. Shantanu Wankhede<br>(MD., DM. (Cardiology))<br>Registration no (MH-124085)</p></div></div>

    <!-- Page Break Hint for Page 5 -->
    <div style="height: 1px;"></div>

    <!-- ========= PAGE 6 CONTENT START ========= -->
    ${this.repeatingHeaderHtml}
    
    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Diet Instruction</div>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Suggested</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Restricted</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
          <tbody><tr><td style="padding: 2px; vertical-align: top;">• Complete bed rest, Physiotherapy, Take Rest<br>• ENT opinion, Pulmonologist opinion</td><td style="padding: 2px; vertical-align: top;">• Avoid heavy exercise until cleared by your healthcare provider<br>• Avoid high-risk activities that may cause falls or injury</td><td style="padding: 2px; vertical-align: top;">• Avoid skipping meals to maintain metabolic balance<br>• Avoid high-risk activities that may cause falls or injury</td></tr></tbody>
      </table>
    </div>

    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Physical Activity Instruction</div>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Suggested</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Restricted</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
          <tbody><tr><td style="padding: 2px; vertical-align: top;">• Complete bed rest, Physiotherapy, Take Rest<br>• ENT opinion, Pulmonologist opinion</td><td style="padding: 2px; vertical-align: top;">• Avoid heavy exercise until cleared by your healthcare provider<br>• Avoid high-risk activities that may cause falls or injury</td><td style="padding: 2px; vertical-align: top;">• Avoid skipping meals to maintain metabolic balance<br>• Avoid high-risk activities that may cause falls or injury</td></tr></tbody>
      </table>
    </div>

    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">General Instruction</div>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Suggested</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Restricted</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
          <tbody><tr><td style="padding: 2px; vertical-align: top;">• Complete bed rest, Physiotherapy, Take Rest<br>• ENT opinion, Pulmonologist opinion</td><td style="padding: 2px; vertical-align: top;">• Avoid heavy exercise until cleared by your healthcare provider<br>• Avoid high-risk activities that may cause falls or injury</td><td style="padding: 2px; vertical-align: top;">• Avoid skipping meals to maintain metabolic balance<br>• Avoid high-risk activities that may cause falls or injury</td></tr></tbody>
      </table>
    </div>

    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Follow up</div>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold;">Start Time</th><th style="text-align: left; padding: 2px; font-weight: bold;">End Time</th><th style="text-align: left; padding: 2px; font-weight: bold;">Purpose Type</th><th style="text-align: left; padding: 2px; font-weight: bold;">Appoint. Mode</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th><th style="text-align: left; padding: 2px; font-weight: bold;">Ref. Doctor</th></tr></thead>
          <tbody><tr><td style="padding: 2px;">03:12 PM</td><td style="padding: 2px;">03:12 PM</td><td style="padding: 2px;">Physiotherapy Care</td><td style="padding: 2px;">By Telephonic</td><td style="padding: 2px;">continue exercises daily</td><td style="padding: 2px;">Dr. Amit Kumar Shah</td></tr></tbody>
      </table>
    </div>

    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">When to Contact</div>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Suggested</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Restricted</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
          <tbody><tr><td style="padding: 2px; vertical-align: top;">• Complete bed rest, Physiotherapy, Take Rest<br>• ENT opinion, Pulmonologist opinion</td><td style="padding: 2px; vertical-align: top;">• Avoid heavy exercise until cleared by your healthcare provider<br>• Avoid high-risk activities that may cause falls or injury</td><td style="padding: 2px; vertical-align: top;">• Avoid skipping meals to maintain metabolic balance<br>• Avoid high-risk activities that may cause falls or injury</td></tr></tbody>
      </table>
    </div>

    <div style="margin-top: 15px;">
      <div style="font-family: sans-serif; font-size: 12px; font-weight: bold; border-bottom: 1px solid #4a4a4a; padding-bottom: 2px;">Information (Patient Education Material)</div>
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; margin-top: 3px;">
          <thead><tr><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Suggested</th><th style="text-align: left; padding: 2px; font-weight: bold; width: 33.3%;">Restricted</th><th style="text-align: left; padding: 2px; font-weight: bold;">Remarks</th></tr></thead>
          <tbody><tr><td style="padding: 2px; vertical-align: top;">• Complete bed rest, Physiotherapy, Take Rest<br>• ENT opinion, Pulmonologist opinion</td><td style="padding: 2px; vertical-align: top;">• Avoid heavy exercise until cleared by your healthcare provider<br>• Avoid high-risk activities that may cause falls or injury</td><td style="padding: 2px; vertical-align: top;">• Avoid skipping meals to maintain metabolic balance<br>• Avoid high-risk activities that may cause falls or injury</td></tr></tbody>
      </table>
    </div>
  `;
}