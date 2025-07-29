// src/app/home/home.component.ts
import { Component } from '@angular/core';
import { PdfPreviewComponent } from '../pdf-preview/pdf-preview.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [PdfPreviewComponent],
  template: `<app-pdf-preview></app-pdf-preview>`,
})
export class HomeComponent {}
