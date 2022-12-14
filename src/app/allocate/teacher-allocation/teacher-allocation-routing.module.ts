import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeacherAllocationPage } from './teacher-allocation.page';

const routes: Routes = [
  {
    path: '',
    component: TeacherAllocationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherAllocationPageRoutingModule {}
