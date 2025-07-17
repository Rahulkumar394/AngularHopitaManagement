import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleAssignmentComponent } from './features/roles-permissions/pages/role-assignment/role-assignment.component';


const routes: Routes = [
  // Route for public pages (Login, Register, etc.)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'auth/login', pathMatch: 'full' }, // Redirect to login by default
      { path: 'public', loadChildren: () => import('./features/public/public.module').then(m => m.PublicModule) },
      { path: 'auth', loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) },
    ]
  },
  
  // --- >> YEH AAPKA MAIN PROTECTED SECTION HAI << ---
  // Route for all protected app pages that need login
  {
    path: 'app',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // This guard protects all child routes
    children: [
      // When user goes to /app, they are redirected to /app/dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      
      // All your feature modules will be here
      { path: 'dashboard', loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'user-management', loadChildren: () => import('./features/user-management/user-management.module').then(m => m.UserManagementModule) },
      { path: 'appointment-booking', loadChildren: () => import('./features/appointment-booking/appointment-booking.module').then(m => m.AppointmentBookingModule) },
      
      // --- >> AAPKA ROLES & PERMISSIONS ROUTE SAHI JAGAH PAR << ---
      { path: 'roles-permissions', component: RoleAssignmentComponent },
      
      // Add more protected feature modules here in the future
    ]
  },

  // Wildcard route for any other URL, redirects to login
  { path: '**', redirectTo: 'auth/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }