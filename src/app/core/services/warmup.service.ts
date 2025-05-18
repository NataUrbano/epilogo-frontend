// src/app/services/warmup.service.ts
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
      return; // Solo hacemos esto una vez por sesión
    }
    
    console.log('Despertando el backend...');
    
    // Primero hacemos ping al endpoint de salud
    this.http.get(`${this.apiUrl}/health`)
      .pipe(
        timeout(60000), // 60 segundos de timeout
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