import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeacherAllocationPageRoutingModule } from './teacher-allocation-routing.module';

import { TeacherAllocationPage } from './teacher-allocation.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeacherAllocationPageRoutingModule
  ],
  declarations: [TeacherAllocationPage]
})
export class TeacherAllocationPageModule {}
