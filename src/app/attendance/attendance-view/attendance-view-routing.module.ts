import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceViewPage } from './attendance-view.page';

const routes: Routes = [
  {
    path: '',
    component: AttendanceViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceViewPageRoutingModule {}
