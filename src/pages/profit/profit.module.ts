import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfitPage } from './profit';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ProfitPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfitPage),
    ComponentsModule,
  ],
})
export class ProfitPageModule {}
