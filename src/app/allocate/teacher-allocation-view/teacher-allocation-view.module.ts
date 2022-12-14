import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeacherAllocationViewPageRoutingModule } from './teacher-allocation-view-routing.module';

import { TeacherAllocationViewPage } from './teacher-allocation-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TeacherAllocationViewPageRoutingModule
  ],
  declarations: [TeacherAllocationViewPage]
})
export class TeacherAllocationViewPageModule {}
