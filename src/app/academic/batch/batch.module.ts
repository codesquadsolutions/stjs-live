import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BatchPageRoutingModule } from './batch-routing.module';

import { BatchPage } from './batch.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BatchPageRoutingModule
  ],
  declarations: [BatchPage]
})
export class BatchPageModule {}
