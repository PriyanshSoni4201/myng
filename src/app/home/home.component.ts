// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { PdfPreviewComponent } from '../pdf-preview/pdf-preview.component';

@Component({
  selector: 'app-home',
  standalone: true, // Ensure this is true
  imports: [PdfPreviewComponent], // If PdfPreviewComponent is standalone, this is correct
  template: `<app-pdf-preview></app-pdf-preview>`,
})
export class HomeComponent {}
