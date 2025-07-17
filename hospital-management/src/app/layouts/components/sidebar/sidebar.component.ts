import { Component } from '@angular/core';
import { AuthService, User } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  public currentUser$: Observable<User | null>;


  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }
  

  get currentUser(): User | null {
    return this.authService.currentUserValue;
  }

  logout() {
    this.authService.logout();
  }
}