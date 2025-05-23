import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component'; // Import DynamicFormComponent

@Component({
  selector: 'app-root',
  standalone: true, // Ensure AppComponent is also standalone if not already
  imports: [RouterOutlet, DynamicFormComponent], // Add DynamicFormComponent here
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dynamic-form-app';
}
