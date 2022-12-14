import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BatchPage } from './batch.page';

const routes: Routes = [
  {
    path: '',
    component: BatchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BatchPageRoutingModule {}
