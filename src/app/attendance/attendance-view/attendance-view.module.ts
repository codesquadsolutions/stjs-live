import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendanceViewPageRoutingModule } from './attendance-view-routing.module';

import { AttendanceViewPage } from './attendance-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendanceViewPageRoutingModule
  ],
  declarations: [AttendanceViewPage]
})
export class AttendanceViewPageModule {}
