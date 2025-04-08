import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherCardComponent } from "./components/weather-card/weather-card.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WeatherCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WeatherApp';
}
