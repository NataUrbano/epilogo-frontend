import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WarmupService {
  private apiUrl = environment.apiUrl;
  private warmedUp = false;

  constructor(private http: HttpClient) { }

  warmupBackend() {
    if (this.warmedUp) {
      return;
    }
    
    console.log('Despertando el backend...');
    
    this.http.get(`${this.apiUrl}/health`)
      .pipe(
        timeout(60000), 
        catchError(error => {
          console.warn('Error al despertar el backend:', error);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          console.log('Backend despertado correctamente');
          this.warmedUp = true;
        }
      });
  }
}