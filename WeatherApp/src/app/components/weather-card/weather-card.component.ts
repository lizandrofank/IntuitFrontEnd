import { Component } from '@angular/core';
import { WeatherService } from '../../services/weather.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WeatherData,DayCurrent, WeatherDataHistory } from '../../models/weather.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule],
  templateUrl: './weather-card.component.html',
  styleUrl: './weather-card.component.css'
})

export class WeatherCardComponent {

    weatherData: WeatherData = this.getEmptyWeatherData();
    dayCurrent: DayCurrent = this.getEmptyDayData();
    weatherDataHistory:WeatherDataHistory = this.getEmptyWeatherDataHistory() ;

    city: string = '';
    errorMessage: string = '';
    selectedDate: Date | null = null;
    

    constructor(private weatherService: WeatherService , private snackBar : MatSnackBar) {}

    SearchWeather() {

      if ((!this.city || this.city.trim() === '') && !this.selectedDate) {
        this.snackBar.open('⚠️ Debe ingresar una ciudad.','Cerrar',{
          duration:3000,horizontalPosition:'right',verticalPosition:'top',}
       );
       return;
      }
      this.weatherService.getCurrentWeather(this.city).subscribe({
         next: (data) => {
              this.dayCurrent = data ? data : this.getEmptyDayData();

              this.weatherService.getExtendedWeather(this.city).subscribe({
                next: (data) => {
                  this.weatherData = data ? data : this.getEmptyWeatherData();
                }});
      },
        error: (error) => {
          this.dayCurrent = this.getEmptyDayData();
          this.weatherData = this.getEmptyWeatherData();
          this.weatherDataHistory = this.getEmptyWeatherDataHistory();
          this.snackBar.open('❌ Ciudad no encontrada.','Cerrar',{
            duration : 3000,
            horizontalPosition:'right',
            verticalPosition: 'top',
          });
        }
      });
    }
 
    searchByDate() {

      if ((!this.city || this.city.trim() === '') && this.selectedDate) {
        this.snackBar.open('⚠️ Debe ingresar una ciudad para consultar su clima historico.','Cerrar',{
          duration:3000,horizontalPosition:'right',verticalPosition:'top',}
       );
        this.dayCurrent = this.getEmptyDayData();
        this.weatherData = this.getEmptyWeatherData();
        this.weatherDataHistory = this.getEmptyWeatherDataHistory();
        return;
      }
      if (this.selectedDate) {
        const formattedDate = this.selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const today = new Date();
        const localDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
     
        if (formattedDate >= localDate){
          this.snackBar.open('⚠️ Debe ingresar una fecha anterior al dia actual para obtener el clima historico.','Cerrar',{
            duration:3000,horizontalPosition:'right',verticalPosition:'top',}
          );
          this.weatherDataHistory = this.getEmptyWeatherDataHistory(); 
          return ;
        }

        this.weatherService.getCurrentWeather(this.city).subscribe(data => { 
          if (data && data.lat && data.lon) {
            const lat = data.lat;
            const lon = data.lon;
            const cityName = data.city;
            this.weatherService.getHistoryWeather(lat, lon, formattedDate,formattedDate)
            .subscribe(data => {
              this.weatherDataHistory = data ? data : this.getEmptyWeatherDataHistory();
              this.weatherDataHistory.city = cityName;
            });
          }});
      }
    }

    private getEmptyWeatherData(): WeatherData {
      return {
        city: '',
        forecast: []
      };
    }
    private getEmptyDayData() :DayCurrent{
      return {
        city: '',
        lat:0,
        lon:0,
        temp_min: 0,
        temp_max: 0,
        humidity: 0,
        rainProbability: '',
      };
    }
    private getEmptyWeatherDataHistory(): WeatherDataHistory {
      return {
        city:'',
        date: '',
        temp_min: 0,
        temp_max: 0,
        humidity: 0,
        rainProbability: '',
      };
    }

    onSearch() {
        this.SearchWeather();
        this.searchByDate();
    }
    
    onClear(){
      this.city='';
      this.selectedDate = null;
      this.dayCurrent = this.getEmptyDayData();
      this.weatherData = this.getEmptyWeatherData();
      this.weatherDataHistory = this.getEmptyWeatherDataHistory();
    }
      
   onDateChange() {
        this.searchByDate();
  }
  
}
  
