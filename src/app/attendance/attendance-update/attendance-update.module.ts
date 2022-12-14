import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendanceUpdatePageRoutingModule } from './attendance-update-routing.module';

import { AttendanceUpdatePage } from './attendance-update.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendanceUpdatePageRoutingModule
  ],
  declarations: [AttendanceUpdatePage]
})
export class AttendanceUpdatePageModule {}
