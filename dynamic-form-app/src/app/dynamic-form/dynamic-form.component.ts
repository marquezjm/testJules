import { Component, ViewChild, ViewContainerRef, Injector, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf, *ngFor etc.
import { TextFieldComponent } from './components/text-field/text-field.component';
import { RadioFieldComponent } from './components/radio-field/radio-field.component';
import { CheckboxFieldComponent } from './components/checkbox-field/checkbox-field.component'; // Import CheckboxFieldComponent
import { DynamicComponent } from './dynamic-component.interface';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, TextFieldComponent, RadioFieldComponent, CheckboxFieldComponent], // Add CheckboxFieldComponent
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true }) dynamicComponentContainer!: ViewContainerRef;

  dynamicControlsForm = new FormGroup({});
  jsonParseError: string | null = null;
  private componentRegistry: { [key: string]: any } = {}; // Using 'any' for now, can be Type<DynamicComponent>
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
      { "label": "Female", "value": "female" }
    ]
  },
  {
    "tipo": "checkbox",
    "label": "I agree to the terms and conditions",
    "controlName": "agreeTerms"
  }
]`;

  // No need to inject ComponentFactoryResolver in Angular 13+
  constructor(private injector: Injector) {}

  ngOnInit(): void {
    this.componentRegistry = {
      'texto': TextFieldComponent,
      'radio': RadioFieldComponent,
      'checkbox': CheckboxFieldComponent // Add this line
    };
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
        const componentType = this.componentRegistry[item.tipo];
        if (componentType) {
          // Create component
          const componentRef = this.dynamicComponentContainer.createComponent(componentType, { injector: this.injector });
          
          // Set data and form
          if (componentRef.instance as DynamicComponent) {
            (componentRef.instance as DynamicComponent).data = item;
            (componentRef.instance as DynamicComponent).form = this.dynamicControlsForm;
          }
        } else {
          console.warn(`Unknown component type: ${item.tipo}`);
          this.jsonParseError = `Unknown component type: ${item.tipo}. Please check the JSON configuration.`;
          // Optionally, add a message to jsonParseError or a specific error property
        }
      });
    } catch (error) {
      this.jsonParseError = 'Invalid JSON format. Please check the syntax.';
      console.error('Error parsing JSON or rendering components:', error);
    }
  }
}
