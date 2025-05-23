import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { CheckboxFieldComponent } from './checkbox-field.component';

describe('CheckboxFieldComponent', () => {
  let component: CheckboxFieldComponent;
  let fixture: ComponentFixture<CheckboxFieldComponent>;
  let parentForm: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CheckboxFieldComponent // Import the standalone component
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckboxFieldComponent);
    component = fixture.componentInstance;

    // Initialize component inputs
    parentForm = new FormGroup({});
    component.form = parentForm;
    component.data = {
      label: 'Test Checkbox Label',
      controlName: 'testCheckboxControl'
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a boolean FormControl to the parent FormGroup on ngOnInit', () => {
    expect(parentForm.get('testCheckboxControl')).toBeFalsy();
    component.ngOnInit();
    expect(parentForm.get('testCheckboxControl')).toBeTruthy();
    expect(parentForm.get('testCheckboxControl') instanceof FormControl).toBe(true);
    expect(parentForm.get('testCheckboxControl')?.value).toBe(false); // Default value
  });

  it('should bind the checkbox input in the template to the FormControl', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const inputElement = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    expect(inputElement).toBeTruthy();

    // Test initial state (unchecked)
    expect(inputElement.nativeElement.checked).toBe(false);

    // Test setting value in form control reflects in checkbox
    parentForm.get('testCheckboxControl')?.setValue(true);
    fixture.detectChanges();
    expect(inputElement.nativeElement.checked).toBe(true);

    // Test clicking checkbox reflects in form control
    inputElement.nativeElement.click();
    fixture.detectChanges();
    expect(parentForm.get('testCheckboxControl')?.value).toBe(false); // Should toggle back to false
    
    inputElement.nativeElement.click();
    fixture.detectChanges();
    expect(parentForm.get('testCheckboxControl')?.value).toBe(true); // Should toggle to true
  });

  it('should display the label correctly, associated with the checkbox', () => {
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('label'));
    expect(labelElement).toBeTruthy();
    // Check if the label contains the text
    expect(labelElement.nativeElement.textContent).toContain('Test Checkbox Label');

    // Check if the input is inside the label, or if 'for' attribute is used (not applicable here as input is inside)
    const inputInsideLabel = labelElement.query(By.css('input[type="checkbox"]'));
    expect(inputInsideLabel).toBeTruthy();
  });
});
