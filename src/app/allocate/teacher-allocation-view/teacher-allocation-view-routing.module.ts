import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeacherAllocationViewPage } from './teacher-allocation-view.page';

const routes: Routes = [
  {
    path: '',
    component: TeacherAllocationViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeacherAllocationViewPageRoutingModule {}
