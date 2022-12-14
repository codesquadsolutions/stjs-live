import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffDetailPage } from './staff-detail.page';

const routes: Routes = [
  {
    path: '',
    component: StaffDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffDetailPageRoutingModule {}
