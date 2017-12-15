import { NgModule } from '@angular/core';
import { KeyRegistrationComponent } from './key-registration/key-registration';
import { IonicModule } from 'ionic-angular';
@NgModule({
	declarations: [KeyRegistrationComponent],
	imports: [
		IonicModule
	],
	entryComponents: [KeyRegistrationComponent],
	exports: [KeyRegistrationComponent]
})
export class ComponentsModule {}
