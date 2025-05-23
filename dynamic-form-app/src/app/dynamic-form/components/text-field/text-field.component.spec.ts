import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { TextFieldComponent } from './text-field.component';

describe('TextFieldComponent', () => {
  let component: TextFieldComponent;
  let fixture: ComponentFixture<TextFieldComponent>;
  let parentForm: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TextFieldComponent // Import the standalone component
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TextFieldComponent);
    component = fixture.componentInstance;

    // Initialize component inputs
    parentForm = new FormGroup({});
    component.form = parentForm;
    component.data = {
      label: 'Test Label',
      controlName: 'testControl'
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a FormControl to the parent FormGroup on ngOnInit', () => {
    expect(parentForm.get('testControl')).toBeFalsy(); // Control should not exist before ngOnInit
    component.ngOnInit(); // Manually call ngOnInit as it's usually called after first change detection
    expect(parentForm.get('testControl')).toBeTruthy();
    expect(parentForm.get('testControl') instanceof FormControl).toBe(true);
  });

  it('should bind the input in the template to the FormControl', () => {
    component.ngOnInit();
    fixture.detectChanges(); // Trigger change detection to bind template

    const inputElement = fixture.debugElement.query(By.css('input[type="text"]'));
    expect(inputElement).toBeTruthy();

    // Test initial value
    expect(inputElement.nativeElement.value).toBe(''); // Default value

    // Test setting value in form control reflects in input
    parentForm.get('testControl')?.setValue('New Value');
    fixture.detectChanges();
    expect(inputElement.nativeElement.value).toBe('New Value');

    // Test changing input value reflects in form control
    inputElement.nativeElement.value = 'Input Changed';
    inputElement.nativeElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(parentForm.get('testControl')?.value).toBe('Input Changed');
  });

  it('should display the label correctly', () => {
    fixture.detectChanges(); // For initial data binding
    const labelElement = fixture.debugElement.query(By.css('label'));
    expect(labelElement).toBeTruthy();
    expect(labelElement.nativeElement.textContent).toBe('Test Label');
  });
});
