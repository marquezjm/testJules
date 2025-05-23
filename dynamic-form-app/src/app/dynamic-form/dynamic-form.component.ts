import { Component, ViewChild, ViewContainerRef, Injector, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf, *ngFor etc.
import { TextFieldComponent } from './components/text-field/text-field.component';
import { RadioFieldComponent } from './components/radio-field/radio-field.component';
import { DynamicComponent } from './dynamic-component.interface';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, TextFieldComponent, RadioFieldComponent],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) dynamicComponentContainer!: ViewContainerRef;

  dynamicControlsForm = new FormGroup({});
  jsonParseError: string | null = null;
  jsonInput: string = `[
  {
    "tipo": "texto",
    "label": "Full Name",
    "controlName": "fullName"
  },
  {
    "tipo": "radio",
    "label": "Gender",
    "controlName": "gender",
    "options": [
      { "label": "Male", "value": "male" },
      { "label": "Female", "value": "female" },
      { "label": "Other", "value": "other" }
    ]
  }
]`;

  // No need to inject ComponentFactoryResolver in Angular 13+
  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.renderComponents();
  }

  onJsonInputChange(): void {
    this.renderComponents();
  }

  renderComponents(): void {
    this.dynamicComponentContainer.clear();
    this.dynamicControlsForm = new FormGroup({}); // Reset the form group
    this.jsonParseError = null; // Reset error message

    try {
      const config = JSON.parse(this.jsonInput);
      config.forEach((item: any) => {
        let componentType: any;
        switch (item.tipo) {
          case 'texto':
            componentType = TextFieldComponent;
            break;
          case 'radio':
            componentType = RadioFieldComponent;
            break;
          default:
            console.error('Unknown component type:', item.tipo);
            return;
        }

        // Create component
        const componentRef = this.dynamicComponentContainer.createComponent(componentType, { injector: this.injector });
        
        // Set data and form
        if (componentRef.instance as DynamicComponent) {
          (componentRef.instance as DynamicComponent).data = item;
          (componentRef.instance as DynamicComponent).form = this.dynamicControlsForm;
        }
      });
    } catch (error) {
      this.jsonParseError = 'Invalid JSON format. Please check the syntax.';
      console.error('Error parsing JSON or rendering components:', error);
    }
  }
}
