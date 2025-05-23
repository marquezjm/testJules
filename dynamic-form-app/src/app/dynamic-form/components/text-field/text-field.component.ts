import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DynamicComponent } from '../../dynamic-component.interface';

@Component({
  selector: 'app-text-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './text-field.component.html',
  styleUrl: './text-field.component.scss'
})
export class TextFieldComponent implements DynamicComponent, OnInit {
  @Input() data: any;
  @Input() form!: FormGroup;

  ngOnInit(): void {
    if (this.data && this.data.controlName && this.form) {
      this.form.addControl(this.data.controlName, new FormControl(''));
    }
  }
}
