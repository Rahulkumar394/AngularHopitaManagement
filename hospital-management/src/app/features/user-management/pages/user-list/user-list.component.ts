import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService, User } from '../../services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  isModalOpen = false;
  addUserForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  users: User[] = [];
  isTableLoading = false;
  isModalLoading = false;

  editingUser: User | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.setupForm();
    this.loadUsers();

    this.addUserForm.get('active')?.valueChanges.subscribe(val => {
    console.log('Toggle changed to:', val);
    });

  }

  setupForm(): void {
    this.addUserForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobile: [''],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: [''],
      role: ['NURSE', [Validators.required]],
      department: [''],
      active: [true],
      // This validator is what was causing the form to be invalid
      agreement: [false, [Validators.requiredTrue]] 
    });
  }

  loadUsers(): void {
    this.isTableLoading = true;
    this.userService.getAllUsers()
      .pipe(finalize(() => this.isTableLoading = false))
      .subscribe({
        next: (data) => { this.users = data; },
        error: (err) => { this.errorMessage = 'Could not load user data.'; }
      });
  }

  openAddModal(): void {
    this.editingUser = null;
    this.addUserForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.addUserForm.get('confirmPassword')?.setValidators([Validators.required]);
    this.addUserForm.get('agreement')?.setValidators([Validators.requiredTrue]);
    this.addUserForm.updateValueAndValidity();
    this.isModalOpen = true;
  }

  openEditModal(user: User): void {
    this.isModalOpen = true;
    this.isModalLoading = true;
    this.editingUser = user;

    this.addUserForm.get('password')?.clearValidators();
    this.addUserForm.get('confirmPassword')?.clearValidators();
    this.addUserForm.get('agreement')?.clearValidators();
    this.addUserForm.updateValueAndValidity();
    
    this.userService.getUserById(user.id)
      .pipe(finalize(() => this.isModalLoading = false))
      .subscribe({
        next: (detailedUser) => {
          this.editingUser = detailedUser;
          this.addUserForm.patchValue({
            firstName: detailedUser.firstName,
            lastName: detailedUser.lastName,
            username: detailedUser.username,
            email: detailedUser.email,
            role: detailedUser.roles[0],
            active: detailedUser.enabled,
          });
          this.addUserForm.get('username')?.disable();
          this.addUserForm.get('email')?.disable();
        },
        error: (err) => {
          alert('Failed to fetch user details. Please try again.');
          this.closeModal();
        }
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }
  
  resetForm(): void {
    this.editingUser = null;
    this.addUserForm.reset({
        role: 'NURSE', active: true, agreement: false
    });
    this.addUserForm.get('username')?.enable();
    this.addUserForm.get('email')?.enable();
    this.errorMessage = null;
  }

  // --- >> FIX: THIS ENTIRE METHOD WAS MISSING << ---
  onFormSubmit(): void {
    if (this.addUserForm.invalid) {
      this.addUserForm.markAllAsTouched();
      console.log("Form is invalid:", this.addUserForm.errors); // Log errors to see why it's invalid
      return;
    }

    const formData = this.addUserForm.getRawValue();

    if (formData.password && (formData.password !== formData.confirmPassword)) {
        this.errorMessage = 'Passwords do not match.';
        return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;

    if (this.editingUser) {
      // --- UPDATE LOGIC ---
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: [formData.role],
        enabled: formData.active,
        mobile: formData.mobile, // Assuming you want to update mobile too
      };
      if (formData.password) {
        (payload as any).password = formData.password;
      }
      this.userService.updateUser(this.editingUser.id, payload)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            alert('User updated successfully!');
            this.closeModal();
            this.loadUsers();
          },
          error: (err) => { this.errorMessage = err.error?.message || 'Update failed.'; }
        });
    } else {
      // --- ADD NEW USER LOGIC ---
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: [formData.role],
        mobile: formData.mobile
      };
      this.userService.registerNewUser(payload)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            alert('User registered successfully!');
            this.closeModal();
            this.loadUsers();
          },
          error: (err) => { this.errorMessage = err.error?.message || 'Registration failed.'; }
        });
    }
  }
  
  onDeleteUser(user: User): void {
    const confirmation = window.confirm(`Are you sure you want to delete the user "${user.username}"? This action cannot be undone.`);

    if (confirmation) {
      this.isTableLoading = true;
      this.userService.deleteUser(user.id)
        .pipe(finalize(() => this.isTableLoading = false))
        .subscribe({
          next: () => {
            alert('User deleted successfully!');
            this.loadUsers();
          },
          error: (err) => {
            alert(`Failed to delete user: ${err.error?.message || 'Server error'}`);
          }
        });
    }
  }

  // Helper function to get initials for the avatar
  getUserInitials(user: User): string {
    const first = user.firstName ? user.firstName.charAt(0) : '';
    const last = user.lastName ? user.lastName.charAt(0) : '';
    return (first + last).toUpperCase();
  }
}