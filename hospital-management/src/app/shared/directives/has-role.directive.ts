import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
// --- >> FIX #1: Import AuthService, not ApiService << ---
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
// --- >> FIX #2: Add the 'export' keyword << ---
export class HasRoleDirective implements OnInit {
  @Input('appHasRole') requiredRole!: string;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    // --- >> FIX #3: Inject AuthService << ---
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check if the user has the required role
    if (this.authService.hasRole(this.requiredRole)) {
      // If they do, render the element
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // If not, clear the element from the DOM
      this.viewContainer.clear();
    }
  }
}