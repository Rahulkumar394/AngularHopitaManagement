import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

// Define interfaces for type safety
export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// --- >> FIX #2A: Match the API response << ---
export interface AuthResponse {
  accessToken: string; // The API returns 'accessToken'
  tokenType: string;   // The API returns 'tokenType'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.loadInitialUser();
    }
  }

  private loadInitialUser(): void {
    const token = this.getToken();
    if (token) {
      const user = this.decodeToken(token);
      if (user) {
        this.currentUserSubject.next(user);
      } else {
        this.logout();
      }
    }
  }

  private decodeToken(token: string): User | null {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    const loginUrl = `${this.apiService.baseUrl}/auth/login`;
    return this.http.post<AuthResponse>(loginUrl, credentials).pipe(
      tap(response => {
        // --- >> FIX #2B: Use 'accessToken' from the response << ---
        if (response && response.accessToken) {
          this.setToken(response.accessToken);
          const user = this.decodeToken(response.accessToken);
          this.currentUserSubject.next(user);
        }
      }),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  registerSuperAdmin(userData: any): Observable<any> {
    const registerUrl = `${this.apiService.baseUrl}/users/register-superadmin`;
    return this.http.post(registerUrl, userData);
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('authToken');
    }
    this.currentUserSubject.next(null);
    if (this.isBrowser) {
      this.router.navigate(['/auth/login']);
    }
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('authToken') : null;
  }

  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('authToken', token);
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // --- >> FIX #1: Add the missing 'hasRole' method << ---
  hasRole(role: string): boolean {
    return this.currentUserValue?.roles?.includes(role) ?? false;
  }
}