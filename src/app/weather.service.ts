// weather.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

 

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  WeatherData :any
  apiUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  getWeather(latitude: number, longitude: number): Observable<any> {
    const params = {
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      hourly: 'temperature_2m',
      // ... add other parameters if needed
    };
  return this.http.get<any>(this.apiUrl, { params });
 
  }
  
  // private getCachedWeather(): Observable<any> {
  //   return this.http.get<any>(this.apiUrl, { params }).pipe(
  //     map(response => {
  //       // Cache the response in localStorage
  //       localStorage.setItem('cachedWeatherData', JSON.stringify(response));
  //       return response;
  //     }),
  //     catchError(() => {
  //       // If an error occurs (e.g., network error), attempt to serve from cache
  //       return this.getCachedWeather();
  //     })
  //   );
  //   // Attempt to retrieve cached weather data
  //   const cachedData = localStorage.getItem('cachedWeatherData');
  //   if (cachedData) {
  //     // If cached data is available, parse and return it
  //     return of(JSON.parse(cachedData));
  //   } else {
  //     // If no cached data is available, return an empty object
  //     return of({ latitude: 0, longitude: 0 });
  //   }
  // }
}
