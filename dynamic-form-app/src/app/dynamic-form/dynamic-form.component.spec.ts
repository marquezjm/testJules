import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, Input, ViewContainerRef, NO_ERRORS_SCHEMA } from '@angular/core';

import { DynamicFormComponent } from './dynamic-form.component';
import { TextFieldComponent } from './components/text-field/text-field.component';
import { RadioFieldComponent } from './components/radio-field/radio-field.component';
import { CheckboxFieldComponent } from './components/checkbox-field/checkbox-field.component';
import { DynamicComponent } from './dynamic-component.interface';

// Simple stubs for the dynamic components
@Component({ selector: 'app-text-field', template: '', standalone: true, imports: [ReactiveFormsModule] })
class StubTextFieldComponent implements DynamicComponent {
  @Input() data: any;
  @Input() form!: FormGroup;
}

@Component({ selector: 'app-radio-field', template: '', standalone: true, imports: [ReactiveFormsModule, CommonModule] })
class StubRadioFieldComponent implements DynamicComponent {
  @Input() data: any;
  @Input() form!: FormGroup;
}

@Component({ selector: 'app-checkbox-field', template: '', standalone: true, imports: [ReactiveFormsModule] })
class StubCheckboxFieldComponent implements DynamicComponent {
  @Input() data: any;
  @Input() form!: FormGroup;
}

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;
  let viewContainerRefSpy: jasmine.SpyObj<ViewContainerRef>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ViewContainerRef', ['createComponent', 'clear']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        CommonModule,
        DynamicFormComponent, // Import the actual component
        // Do not import actual TextFieldComponent, RadioFieldComponent, CheckboxFieldComponent here if using stubs globally
      ],
      providers: [
        { provide: ViewContainerRef, useValue: spy }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Use NO_ERRORS_SCHEMA to allow stubbing/mocking of child components not fully declared
    })
    // Override component's own imports if necessary, or ensure stubs are used.
    // TestBed.overrideComponent(DynamicFormComponent, {
    //   remove: { imports: [TextFieldComponent, RadioFieldComponent, CheckboxFieldComponent]},
    //   add: { imports: [StubTextFieldComponent, StubRadioFieldComponent, StubCheckboxFieldComponent]}
    // })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    
    // Manually assign the viewContainerRef spy to the component instance
    // This is a common way to handle ViewChild in tests if it's not easily provided.
    // However, the #dynamicComponentContainer is part of the template, so it should be picked up.
    // If direct assignment is needed: component.dynamicComponentContainer = spy;
    viewContainerRefSpy = TestBed.inject(ViewContainerRef) as jasmine.SpyObj<ViewContainerRef>;
    // Assign the spy to the component's ViewChild property
    component.dynamicComponentContainer = viewContainerRefSpy;


    // Initialize the componentRegistry with stubs for testing purposes
    (component as any).componentRegistry = {
      'texto': StubTextFieldComponent,
      'radio': StubRadioFieldComponent,
      'checkbox': StubCheckboxFieldComponent
    };

    fixture.detectChanges(); // Initial binding and ngOnInit call
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('JSON Parsing', () => {
    it('should be null for jsonParseError with valid JSON and attempt to render components', () => {
      component.jsonInput = '[{"tipo": "texto", "label": "Name", "controlName": "name"}]';
      component.renderComponents();
      expect(component.jsonParseError).toBeNull();
      expect(viewContainerRefSpy.clear).toHaveBeenCalled();
      expect(viewContainerRefSpy.createComponent).toHaveBeenCalled();
    });

    it('should set jsonParseError with invalid JSON and not render components', () => {
      component.jsonInput = '[{"tipo": "texto", "label": "Name", "controlName": "name"}'; // Invalid JSON
      component.renderComponents();
      expect(component.jsonParseError).toBe('Invalid JSON format. Please check the syntax.');
      expect(viewContainerRefSpy.clear).toHaveBeenCalled();
      // createComponent should not be called if JSON parsing fails
      expect(viewContainerRefSpy.createComponent).not.toHaveBeenCalled();
    });
     it('should set jsonParseError for unknown component type and not render that specific component', () => {
      component.jsonInput = '[{"tipo": "unknown", "label": "Test", "controlName": "test"}]';
      component.renderComponents();
      expect(component.jsonParseError).toBe('Unknown component type: unknown. Please check the JSON configuration.');
      expect(viewContainerRefSpy.clear).toHaveBeenCalled();
      expect(viewContainerRefSpy.createComponent).not.toHaveBeenCalled();
    });
  });

  describe('Dynamic Component Creation and FormGroup Population', () => {
    let mockComponentRef: any;

    beforeEach(() => {
      // Reset spy calls for createComponent before each test in this describe block
      viewContainerRefSpy.createComponent.calls.reset();
      
      // Mock the component reference that createComponent returns
      mockComponentRef = {
        instance: {
          data: null, // Will be set by the component
          form: null  // Will be set by the component
        }
      };
      // Configure the spy to return our mock component reference
      viewContainerRefSpy.createComponent.and.returnValue(mockComponentRef as any);
    });

    it('should create registered components and populate form group', () => {
      const testJson = `[
        {"tipo": "texto", "label": "Name", "controlName": "name"},
        {"tipo": "radio", "label": "Choice", "controlName": "choice", "options": [{"label": "A", "value": "a"}]},
        {"tipo": "checkbox", "label": "Agree", "controlName": "agree"}
      ]`;
      component.jsonInput = testJson;
      component.renderComponents();

      expect(component.jsonParseError).toBeNull();
      expect(viewContainerRefSpy.clear).toHaveBeenCalled();
      
      // Check that createComponent was called for each type
      expect(viewContainerRefSpy.createComponent).toHaveBeenCalledWith(StubTextFieldComponent, jasmine.any(Object));
      expect(viewContainerRefSpy.createComponent).toHaveBeenCalledWith(StubRadioFieldComponent, jasmine.any(Object));
      expect(viewContainerRefSpy.createComponent).toHaveBeenCalledWith(StubCheckboxFieldComponent, jasmine.any(Object));
      expect(viewContainerRefSpy.createComponent).toHaveBeenCalledTimes(3);

      // Check that data and form were assigned to the instances
      // This relies on the mockComponentRef being returned each time.
      // For more specific checks, you might need to make the spy return different refs or inspect calls.args.
      const parsedConfig = JSON.parse(testJson);
      
      // Example check for the first call (TextField)
      // This is a bit simplified as the mockComponentRef.instance is reused.
      // A more robust spy setup would be needed if the exact instance per call needs to be verified.
      const firstCallArgs = viewContainerRefSpy.createComponent.calls.argsFor(0);
      const firstComponentType = firstCallArgs[0]; // The component constructor/type
      
      // We can check if the instance properties were set (at least for the last component created if instance is reused)
      expect(mockComponentRef.instance.data).toEqual(parsedConfig[2]); // Last one is checkbox
      expect(mockComponentRef.instance.form).toBe(component.dynamicControlsForm);


      // Check FormGroup population
      expect(component.dynamicControlsForm.get('name')).toBeTruthy();
      expect(component.dynamicControlsForm.get('choice')).toBeTruthy();
      expect(component.dynamicControlsForm.get('agree')).toBeTruthy();
    });

    it('should handle JSON with only one component type correctly', () => {
      component.jsonInput = '[{"tipo": "checkbox", "label": "Subscribe", "controlName": "subscribe"}]';
      component.renderComponents();

      expect(component.jsonParseError).toBeNull();
      expect(viewContainerRefSpy.createComponent).toHaveBeenCalledWith(StubCheckboxFieldComponent, jasmine.any(Object));
      expect(viewContainerRefSpy.createComponent).toHaveBeenCalledTimes(1);
      expect(component.dynamicControlsForm.get('subscribe')).toBeTruthy();
    });
  });
});
