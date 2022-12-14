import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceUpdatePage } from './attendance-update.page';

const routes: Routes = [
  {
    path: '',
    component: AttendanceUpdatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceUpdatePageRoutingModule {}
