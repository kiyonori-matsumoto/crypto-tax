import { NgModule } from '@angular/core';
import { KeyRegistrationComponent } from './key-registration/key-registration';
import { IonicModule } from 'ionic-angular';
import { FundsChartComponent } from './funds-chart/funds-chart';
import { ProfitListComponent } from './profit-list/profit-list';
@NgModule({
	declarations: [KeyRegistrationComponent,
    FundsChartComponent,
    ProfitListComponent,
    ],
	imports: [
		IonicModule
	],
	entryComponents: [KeyRegistrationComponent],
	exports: [KeyRegistrationComponent,
    FundsChartComponent,
    ProfitListComponent,
    ]
})
export class ComponentsModule {}
