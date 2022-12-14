import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StudentDetailPageRoutingModule } from './student-detail-routing.module';

import { StudentDetailPage } from './student-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StudentDetailPageRoutingModule
  ],
  declarations: [StudentDetailPage]
})
export class StudentDetailPageModule {}
