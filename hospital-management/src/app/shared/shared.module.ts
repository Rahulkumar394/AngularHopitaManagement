import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HasRoleDirective } from './directives/has-role.directive';

// --- >> FIX: Add the @NgModule decorator and its properties << ---
@NgModule({
  declarations: [
    HasRoleDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    HasRoleDirective
  ]
})
export class SharedModule { }