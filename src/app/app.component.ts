import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserResponseDTO } from './core/models/userResponseDTO.model';
import { UsersService } from './core/services/users.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  
  userResponseDTO: UserResponseDTO[] = [];
  
  constructor(private userService: UsersService) {}

  ngOnInit(): void {
    this.userService.getAllUsers()
      .subscribe({
        next: (data: UserResponseDTO[]) => {
          console.log(data)
          this.userResponseDTO = data;
        },
        error: (err) => {
          console.error('Error al obtener usuarios:', err);
        }
      });
  }
}