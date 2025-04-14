import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserResponseDTO } from '../models/userResponseDTO.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly apiUrl = 'http://localhost:8080/api/users';

  constructor(private http:HttpClient) {
    
   }

   getAllUsers(): Observable<UserResponseDTO[]> {
    return this.http.get<UserResponseDTO[]>(this.apiUrl);
  }
}
