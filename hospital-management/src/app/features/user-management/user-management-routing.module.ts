import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component'; // Component import karein

const routes: Routes = [
  {
    path: '', // Jab /user-management par aaye, toh yeh component dikhaye
    component: UserListComponent 
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
