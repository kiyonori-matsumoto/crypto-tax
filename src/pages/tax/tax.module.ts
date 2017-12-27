import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaxPage } from './tax';

@NgModule({
  declarations: [
    TaxPage,
  ],
  imports: [
    IonicPageModule.forChild(TaxPage),
  ],
})
export class TaxPageModule {}
