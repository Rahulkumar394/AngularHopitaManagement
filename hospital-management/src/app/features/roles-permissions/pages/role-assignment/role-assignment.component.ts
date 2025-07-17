import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { UserService, User } from '../../../user-management/services/user.service';

interface Role {
  id: string; 
  name: string;
  description: string;
}
type RoleKey = 'SUPER_ADMIN' | 'ADMIN' | 'PATIENT' | 'HR_MANAGER' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'BILLING_CLERK' | 'PHARMACIST';

@Component({
  selector: 'app-role-assignment',
  templateUrl: './role-assignment.component.html',
  styleUrls: ['./role-assignment.component.scss']
})
export class RoleAssignmentComponent implements OnInit, OnDestroy {
  
  users: User[] = [];
  allSystemRoles: Role[] = [];
  selectedUser: User | null = null;
  
  // --- >> NEW: Track the original state for the Reset button << ---
  private originalUserRoles: string[] = [];
  
  availableRoles: Role[] = [];
  assignedRoles: Role[] = [];
  selectedAvailableRoles = new Set<Role>();

  isUserListLoading = false;
  isRolesLoading = false;
  // --- >> NEW: Add a saving state for the button spinner << ---
  isSaving = false;
  
  private subscriptions = new Subscription();

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers(); 
    this.loadAllRoles();
  }

  loadUsers(): void {
    this.isUserListLoading = true;
    this.subscriptions.add(
      this.userService.getAllUsers()
        .pipe(finalize(() => this.isUserListLoading = false))
        .subscribe({
          next: (data) => {
            this.users = data;
            if (this.users.length > 0) this.selectUser(this.users[0]);
          },
          error: (err) => { console.error('Failed to load users', err); this.users = []; }
        })
    );
  }

  loadAllRoles(): void {
    this.isRolesLoading = true;
    this.subscriptions.add(
      this.userService.getAllSystemRoles()
        .pipe(finalize(() => this.isRolesLoading = false))
        .subscribe({
          next: (roleNames: string[]) => {
            this.allSystemRoles = roleNames.map(name => this.mapRoleNameToRoleObject(name));
            this.updateRoleLists();
          },
          error: (err) => { console.error('Failed to load roles', err); }
        })
    );
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    // --- >> Store a copy of the original roles when a user is selected << ---
    this.originalUserRoles = [...user.roles];
    this.updateRoleLists();
  }

  updateRoleLists(): void {
    if (!this.selectedUser || this.allSystemRoles.length === 0) {
      this.availableRoles = [];
      this.assignedRoles = [];
      return;
    }
    
    const userRoleIds = this.selectedUser.roles;
    this.assignedRoles = this.allSystemRoles.filter(role => userRoleIds.includes(role.id));
    this.availableRoles = this.allSystemRoles.filter(role => !userRoleIds.includes(role.id));
    
    this.selectedAvailableRoles.clear();
  }

  onAvailableRoleSelect(role: Role, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedAvailableRoles.add(role);
    } else {
      this.selectedAvailableRoles.delete(role);
    }
  }

  addSelectedRoles(): void {
    const currentUser = this.selectedUser;
    if (!currentUser) return; 
    
    this.selectedAvailableRoles.forEach(role => {
      if (!currentUser.roles.includes(role.id)) {
        currentUser.roles.push(role.id);
      }
    });

    this.updateRoleLists();
  }
  
  removeAssignedRole(roleToRemove: Role): void {
    const currentUser = this.selectedUser;
    if (!currentUser) return;

    currentUser.roles = currentUser.roles.filter(roleId => roleId !== roleToRemove.id);
    
    this.updateRoleLists();
  }

  // --- >> NEW: Logic for the "Reset" button << ---
  onResetChanges(): void {
    if (!this.selectedUser) return;
    // Restore the user's roles from the saved original state
    this.selectedUser.roles = [...this.originalUserRoles];
    // Refresh the UI to reflect the reset
    this.updateRoleLists();
    alert('Changes have been reset.');
  }

  // --- >> NEW: Logic for the "Save Changes" button << ---
  onSaveChanges(): void {
    if (!this.selectedUser) {
      alert('No user selected.');
      return;
    }

    this.isSaving = true;
    const username = this.selectedUser.username;
    const updatedRoles = this.selectedUser.roles;

    this.subscriptions.add(
      this.userService.updateUserRoles(username, updatedRoles)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: (response) => {
            alert('Roles updated successfully!');
            // Update the original state to the new saved state
            this.originalUserRoles = [...updatedRoles];
            // this.loadUsers(); // Optional: Refresh the whole user list
          },
          error: (err) => {
            console.error('Failed to update roles', err);
            alert(`Error updating roles: ${err.error?.message || 'Please try again.'}`);
            // If save fails, it's good practice to reset to the last known good state
            this.onResetChanges();
          }
        })
    );
  }

  getUserInitials(user: User | null): string {
    if (!user) return '';
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
  }

  private mapRoleNameToRoleObject(roleName: string): Role {
    const descriptions: { [key in RoleKey]: string } = {
      SUPER_ADMIN: 'Full unrestricted access to all system features.',
      ADMIN: 'Can manage users, settings, and administrative tasks.',
      PATIENT: 'Can view appointments and personal records.',
      HR_MANAGER: 'Can manage employee data and HR functions.',
      DOCTOR: 'Can manage patient records and appointments.',
      NURSE: 'Assists doctors and manages patient care.',
      RECEPTIONIST: 'Manages patient check-ins and appointments.',
      BILLING_CLERK: 'Manages patient billing and financial records.',
      PHARMACIST: 'Manages pharmacy inventory and prescriptions.'
    };
    
    return {
      id: roleName,
      name: roleName.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
      description: descriptions[roleName as RoleKey] || 'Standard access for this role.'
    };
  }

  ngOnDestroy(): void {
    // This is important to prevent memory leaks when you navigate away from the page
    this.subscriptions.unsubscribe();
  }
}