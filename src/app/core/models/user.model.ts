export interface User {
  userId: number;
  userName: string;
  email: string;
  imageUrl?: string;
  registerDate: string;
  isActive: boolean;
  roles: string[]; 
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegistration {
  userName: string;
  email: string;
  password: string;
  isActive : boolean;
}

export interface UserProfile {
  userId: number;
  userName: string;
  imageUrl?: string;
}

export interface UserUpdate {
  userName?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  userName: string;
  email: string;
  imageUrl?: string;
  roles: string[]; 
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserUpdateAdmin {
  userName?: string;
  email?: string;
  roles?: string[];
  isActive?: boolean;
  password?: string; 
}

export interface UserRolesUpdate {
  roles: string[];
}

export interface UserStatusUpdate {
  isActive: boolean;
}