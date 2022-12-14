import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceTodayPage } from './attendance-today.page';

const routes: Routes = [
  {
    path: '',
    component: AttendanceTodayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceTodayPageRoutingModule {}
