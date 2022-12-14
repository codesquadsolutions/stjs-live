import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendanceTodayPageRoutingModule } from './attendance-today-routing.module';

import { AttendanceTodayPage } from './attendance-today.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendanceTodayPageRoutingModule
  ],
  declarations: [AttendanceTodayPage]
})
export class AttendanceTodayPageModule {}
