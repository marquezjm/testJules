import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DynamicComponent } from '../../dynamic-component.interface'; // Corrected path

@Component({
  selector: 'app-checkbox-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './checkbox-field.component.html',
  styleUrl: './checkbox-field.component.scss'
})
export class CheckboxFieldComponent implements DynamicComponent, OnInit {
  @Input() data: any; // Expected: { label: string, controlName: string }
  @Input() form!: FormGroup;

  ngOnInit(): void {
    if (this.data && this.data.controlName && this.form) {
      this.form.addControl(this.data.controlName, new FormControl(false)); // Default to false (unchecked)
    }
  }
}
