import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { TabsPage } from '../tabs/tabs';
import * as firebase from 'firebase';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  email = "";
  password = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afAuth: AngularFireAuth,
    private alert: AlertController,
  ) {
  }

  loginByEmail() {
  }

  loginByGoogle() {
    this.afAuth.auth.setPersistence('local');
    this.afAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider())
    .then(() => {
      this.navCtrl.setRoot(TabsPage);
    })
    .catch(err => {
      this.alert.create({message: err.message, buttons: ['OK'], title: 'Error'}).present();
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

}
