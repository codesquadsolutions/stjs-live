import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BatchesPageRoutingModule } from './batches-routing.module';

import { BatchesPage } from './batches.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BatchesPageRoutingModule
  ],
  declarations: [BatchesPage]
})
export class BatchesPageModule {}
