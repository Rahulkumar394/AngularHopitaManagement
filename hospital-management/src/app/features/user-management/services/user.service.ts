// src/app/modules/user/services/user.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  enabled: boolean;
  mobile?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getAllUsers(): Observable<User[]> {
    const usersUrl = `${this.apiService.baseUrl}/users`;
    return this.http.get<User[]>(usersUrl, { headers: this.getAuthHeaders() });
  }

  getUserById(id: number): Observable<User> {
    const url = `${this.apiService.baseUrl}/users/${id}`;
    return this.http.get<User>(url, { headers: this.getAuthHeaders() });
  }

  registerNewUser(userData: any): Observable<any> {
    const registerUrl = `${this.apiService.baseUrl}/users`;
    return this.http.post(registerUrl, userData, { headers: this.getAuthHeaders() });
  }

  updateUser(id: number, userData: any): Observable<any> {
    const updateUrl = `${this.apiService.baseUrl}/users/${id}`;
    return this.http.put(updateUrl, userData, { headers: this.getAuthHeaders() });
  }

  deleteUser(id: number): Observable<any> {
    const url = `${this.apiService.baseUrl}/users/${id}`;
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  getAllSystemRoles(): Observable<string[]> {
    const rolesUrl = `${this.apiService.baseUrl}/users/roles`;
    return this.http.get<string[]>(rolesUrl, { headers: this.getAuthHeaders() });
  }

  updateUserRoles(username: string, roles: string[]): Observable<any> {
    const url = `${this.apiService.baseUrl}/users/username/${username}/roles`;
    return this.http.patch(url, roles, { headers: this.getAuthHeaders() });
  }
}