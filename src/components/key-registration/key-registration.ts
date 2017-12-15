import { Component, Output } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular/navigation/nav-params';
import { ViewController } from 'ionic-angular/navigation/view-controller';

/**
 * Generated class for the KeyRegistrationComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'key-registration',
  templateUrl: 'key-registration.html'
})
export class KeyRegistrationComponent {

  @Output()
  key: string;

  @Output()
  secret: string;

  provider: string;

  constructor(
    params: NavParams,
    private viewCtrl: ViewController,
  ) {
    console.log('Hello KeyRegistrationComponent Component');
    this.provider = params.get('provider');
    this.key = params.get('key');
    this.secret = params.get('secret');
  }

  connect() {
    const data = { 'key': this.key, 'secret': this.secret }
    this.viewCtrl.dismiss(data);
  }

}
