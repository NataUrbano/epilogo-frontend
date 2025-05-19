import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  
  sidebarCollapsed: boolean = false;
  isMobile: boolean = false;
  currentUser: User | null = null;
  
  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
    
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.authService.getCurrentUserInfo();
  }
  
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidebarCollapsed = true;
    }
  }
  
  get hasAdminRole(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
  
  get hasLibrarianRole(): boolean {
    return this.authService.hasRole('ROLE_LIBRARIAN');
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  logout(): void {
    this.authService.logout();
  }
}