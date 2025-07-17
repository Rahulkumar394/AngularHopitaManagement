import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentBookingRoutingModule } from './appointment-booking-routing.module';
import { BookingComponent } from './pages/booking/booking.component';


@NgModule({
  declarations: [
    BookingComponent
  ],
  imports: [
    CommonModule,
    AppointmentBookingRoutingModule
  ]
})
export class AppointmentBookingModule { }
