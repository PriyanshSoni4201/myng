// src/app/editor/editor.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EditorModule } from 'primeng/editor';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent {
  @Input() initialContent: string = '';
  @Output() save = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  content: string = '';

  ngOnInit() {
    this.content = this.initialContent;
  }

  onSave() {
    this.save.emit(this.content);
  }

  onCancel() {
    this.cancel.emit();
  }
}
