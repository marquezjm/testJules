import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl, CommonModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { RadioFieldComponent } from './radio-field.component';

describe('RadioFieldComponent', () => {
  let component: RadioFieldComponent;
  let fixture: ComponentFixture<RadioFieldComponent>;
  let parentForm: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule, // RadioFieldComponent uses *ngFor
        RadioFieldComponent // Import the standalone component
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RadioFieldComponent);
    component = fixture.componentInstance;

    // Initialize component inputs
    parentForm = new FormGroup({});
    component.form = parentForm;
    component.data = {
      label: 'Test Radio Group',
      controlName: 'testRadioControl',
      options: [
        { label: 'Option 1', value: 'opt1' },
        { label: 'Option 2', value: 'opt2' },
      ]
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a FormControl to the parent FormGroup on ngOnInit', () => {
    expect(parentForm.get('testRadioControl')).toBeFalsy();
    component.ngOnInit();
    expect(parentForm.get('testRadioControl')).toBeTruthy();
    expect(parentForm.get('testRadioControl') instanceof FormControl).toBe(true);
  });

  it('should display the main label correctly', () => {
    fixture.detectChanges();
    const labelElement = fixture.debugElement.query(By.css('label.main-label'));
    expect(labelElement).toBeTruthy();
    expect(labelElement.nativeElement.textContent).toBe('Test Radio Group');
  });

  it('should render radio options correctly and bind them to the FormControl', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const radioInputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));
    expect(radioInputs.length).toBe(2);

    const radioLabels = fixture.debugElement.queryAll(By.css('div.radio-option label'));
    expect(radioLabels.length).toBe(2);
    expect(radioLabels[0].nativeElement.textContent.trim()).toBe('Option 1');
    expect(radioLabels[1].nativeElement.textContent.trim()).toBe('Option 2');

    // Test initial value (should be null or empty string as per FormControl default)
    expect(parentForm.get('testRadioControl')?.value).toBe('');

    // Test selecting a radio option
    radioInputs[0].nativeElement.click(); // Click the first radio button
    fixture.detectChanges();
    expect(parentForm.get('testRadioControl')?.value).toBe('opt1');

    radioInputs[1].nativeElement.click(); // Click the second radio button
    fixture.detectChanges();
    expect(parentForm.get('testRadioControl')?.value).toBe('opt2');
  });

  it('should have correct name and id for radio inputs for accessibility and functionality', () => {
    component.ngOnInit();
    fixture.detectChanges();

    const radioInputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));
    radioInputs.forEach((radioInputDebugElement, index) => {
      const radioInputElement = radioInputDebugElement.nativeElement as HTMLInputElement;
      const optionValue = component.data.options[index].value;
      
      expect(radioInputElement.name).toBe('testRadioControl');
      expect(radioInputElement.id).toBe(`testRadioControl_${optionValue}`);
      
      const correspondingLabel = fixture.debugElement.query(By.css(`label[for="testRadioControl_${optionValue}"]`));
      expect(correspondingLabel).toBeTruthy();
    });
  });
});
