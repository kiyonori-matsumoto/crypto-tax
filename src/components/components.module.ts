import { NgModule } from '@angular/core';
import { KeyRegistrationComponent } from './key-registration/key-registration';
import { IonicModule } from 'ionic-angular';
import { FundsChartComponent } from './funds-chart/funds-chart';
import { ProfitListComponent } from './profit-list/profit-list';
import { PipesModule } from '../pipes/pipes.module';
@NgModule({
	declarations: [KeyRegistrationComponent,
    FundsChartComponent,
    ProfitListComponent,
    ],
	imports: [
        IonicModule,
        PipesModule,
	],
	entryComponents: [KeyRegistrationComponent],
	exports: [KeyRegistrationComponent,
    FundsChartComponent,
    ProfitListComponent,
    ]
})
export class ComponentsModule {}
