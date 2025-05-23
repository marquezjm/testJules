import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { DynamicComponent } from '../../dynamic-component.interface';

@Component({
  selector: 'app-radio-field',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Add CommonModule here
  templateUrl: './radio-field.component.html',
  styleUrl: './radio-field.component.scss'
})
export class RadioFieldComponent implements DynamicComponent, OnInit {
  @Input() data: any; // Expected: { label: string, controlName: string, options: { label: string, value: string }[] }
  @Input() form!: FormGroup;

  ngOnInit(): void {
    if (this.data && this.data.controlName && this.form) {
      this.form.addControl(this.data.controlName, new FormControl(''));
    }
  }
}
