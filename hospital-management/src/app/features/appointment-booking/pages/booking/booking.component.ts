import { Component } from '@angular/core';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent {
  // Flags to control the visibility of each modal
  isPatientSearchModalOpen = false;
  isRegistrationModalOpen = false;
  isConfirmationModalOpen = false;
  activeTab: 'demographics' | 'referrer' | 'additional' = 'demographics';

  constructor() { }

  // Methods to open and close the modals
  openPatientSearchModal(): void {
    this.isPatientSearchModalOpen = true;
  }

  closePatientSearchModal(): void {
    this.isPatientSearchModalOpen = false;
  }

  openRegistrationModal(): void {
    this.isPatientSearchModalOpen = false; // Close the search modal first
    this.isRegistrationModalOpen = true;
    this.activeTab = 'demographics'; // Reset to first tab
  }

  closeRegistrationModal(): void {
    this.isRegistrationModalOpen = false;
  }

  openConfirmationModal(): void {
    this.isRegistrationModalOpen = false; // Close the registration modal
    this.isConfirmationModalOpen = true;
  }

  closeConfirmationModal(): void {
    this.isConfirmationModalOpen = false;
  }

  // Method to handle tab switching in the registration modal
  setActiveTab(tabName: 'demographics' | 'referrer' | 'additional'): void {
    this.activeTab = tabName;
  }
}