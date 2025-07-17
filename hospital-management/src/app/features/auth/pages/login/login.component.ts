import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faHospital, faUserDoctor, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  // Icons for template
  faHospital = faHospital;
  faUserDoctor = faUserDoctor;
  faEye = faEye;
  faSpinner = faSpinner;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private iconLibrary: FaIconLibrary
  ) {
    this.iconLibrary.addIcons(faHospital, faUserDoctor, faEye, faSpinner);
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['superadmin1', [Validators.required]],
      password: ['supersecurepassword', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    this.authService.login(this.loginForm.value)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          console.log('Login success:', response);
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
      });
  }
}
