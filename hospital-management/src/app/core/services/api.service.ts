import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // This is the base URL for all your backend API calls
  readonly baseUrl = 'http://localhost:8080/api';

  constructor() { }
}