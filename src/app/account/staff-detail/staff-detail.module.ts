import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffDetailPageRoutingModule } from './staff-detail-routing.module';

import { StaffDetailPage } from './staff-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StaffDetailPageRoutingModule
  ],
  declarations: [StaffDetailPage]
})
export class StaffDetailPageModule {}
