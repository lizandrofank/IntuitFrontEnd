import { Injectable, IterableDiffers } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { WeatherData,DayCurrent, WeatherDataHistory } from '../models/weather.model';
import { catchError, map } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { environment } from '../../environments/environments';


@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = `${environment.apiKey}`;
  private apiUrl = 'https://api.openweathermap.org/data/2.5/';
  private apiUrl_M = 'https://archive-api.open-meteo.com/v1/archive';
   
  constructor(private http: HttpClient) {}
  
  // Obtener el pronostico actual.

  getCurrentWeather(city: string): Observable<DayCurrent | null> {
    const url = `${this.apiUrl}forecast?q=${city}&appid=${this.apiKey}&units=metric&lang=es`;
    return this.http.get<any>(url).pipe(
      map(response =>{

        const today = new Date();
        const localDate = today.getFullYear() + '-' + 
          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
          String(today.getDate()).padStart(2, '0');

        // Filtrar solo registros de días de hoy
        const filteredData = response.list.filter((item: any) => item.dt_txt.split(" ")[0] == localDate);

        return{
        city: response.city.name,
        lat:response.city.coord.lat,
        lon:response.city.coord.lon,
        temp_min: Math.min(...filteredData.map((item: any) => item.main.temp_min)),
        temp_max: Math.max(...filteredData.map((item: any) => item.main.temp_max)),
        humidity:  Math.max(...filteredData.map((item: any) => item.main.humidity)),
        rainProbability : this.getRainProbability(Math.max(...filteredData.map((item: any) => item.pop)))
        }
      }),
      catchError( 
          error => {return throwError(() => error)}
        ) 
    );
  }

  // Obtener el pronóstico para los próximos 5 días.

  getExtendedWeather(city: string): Observable<WeatherData | null> {
    const url = `${this.apiUrl}forecast?q=${city}&appid=${this.apiKey}&units=metric`;
    
    return this.http.get<any>(url).pipe(
      map(response => {

        const today = new Date();
        const localDate = today.getFullYear() + '-' + 
          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
          String(today.getDate()).padStart(2, '0');

        // Filtrar solo registros de días posteriores a hoy
        const filteredData = response.list.filter((item: any) => item.dt_txt.split(" ")[0] > localDate);

        const weatherDataMap: { [date: string]: { temp_min: number; temp_max: number; pop:number; item: any } } = {};

        filteredData.forEach((item: any) => {
          const date= item.dt_txt.split(" ")[0];
          const temp_min = item.main.temp_min;
          const temp_max = item.main.temp_max;
          const pop = item.pop;

          if (!weatherDataMap[date]) {
            weatherDataMap[date] = {
              pop,
              temp_min,
              temp_max,
              item
            };
          } else {
            // Actualiza las temperaturas máxima y mínima.
            weatherDataMap[date].temp_min = Math.min(weatherDataMap[date].temp_min, temp_min);
            weatherDataMap[date].temp_max = Math.max(weatherDataMap[date].temp_max, temp_max);
            weatherDataMap[date].pop = Math.max(weatherDataMap[date].pop,pop);
          }
        });
    
        // Convertir 'weatherDataMap' en un array de 'WeatherData'
        const forecastArray = Object.keys(weatherDataMap).map(date => ({
          date: weatherDataMap[date].item.dt_txt,
          temp_min: weatherDataMap[date].temp_min,
          temp_max: weatherDataMap[date].temp_max,
          humidity: weatherDataMap[date].item.main.humidity,
          rainProbability: this.getRainProbability(weatherDataMap[date].pop),
        })).slice(0,5);
        
        return {
          city: response.city.name,
          forecast: forecastArray
        };
      }),
      catchError( error => {return throwError(() => error)})
    );
  }

 // Obtener probabilidad de lluvia.

  public getRainProbability(pop: number): string {
    if (pop >= 0.7) return `Alta ${(pop * 100).toFixed(1)} %`;
    if (pop >= 0.3) return `Media ${(pop * 100).toFixed(1)} %`;
    return `Baja ${(pop * 100).toFixed(1)} %`;
  }
 
  // Obtener datos historios desde Api Meteo.

  public getHistoryWeather (lat:number , lon: number , startDate : string , endDate : string) : Observable<WeatherDataHistory | null >{
    const url = `${this.apiUrl_M}?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_min,temperature_2m_max&hourly=temperature_2m,relative_humidity_2m,rain`;
    console.log(url);
    return this.http.get<any>(url).pipe(map(
      response => {
        if(response){
          return <any> {
            city: '',
            date : response.daily.time[0],
            temp_min: Math.min(...response.daily.temperature_2m_min),
            temp_max: Math.max(... response.daily.temperature_2m_max),
            humidity: Math.max(...response.hourly.relative_humidity_2m),
            rainProbability:this.getRainProbability(((((Math.max(...response.hourly.rain)/100)))))
          };
        }
        return null;
      }),
      catchError (error =>{
        throw error;
      })
    );
  }

}

