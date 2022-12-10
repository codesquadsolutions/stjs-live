import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BatchesPage } from './batches.page';

const routes: Routes = [
  {
    path: '',
    component: BatchesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BatchesPageRoutingModule {}
