import { Component, OnInit } from '@angular/core';
import { UserResponseDTO } from './core/models/userResponseDTO.model';
import { UsersService } from './core/services/users.service';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
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
