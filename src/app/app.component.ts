import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { ListPage } from '../pages/list/list';
// import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { AngularFireAuth } from 'angularfire2/auth';

import { GoogleAnalytics } from '@ionic-native/google-analytics'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = 'TabsPage'; //HomePage;

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private afAuth: AngularFireAuth,
    private ga: GoogleAnalytics,
  ) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: 'HomePage' },
      { title: 'List', component: ListPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();


      this.checkAuthStatus();
      
      // if (this.platform.is('cordova')) {
      //   this.afAuth.authState.map(e => e ? e.uid : '')
      //   .subscribe(uid => {
      //     this.ga.setUserId(uid);
      //   })
      //   this.ga.startTrackerWithId('UA-80739523-4')
      //   .then(() => {
      //     console.log('start tracking');
      //   })
      // }
    });
  }

  checkAuthStatus() {
    this.afAuth.authState.take(1).subscribe(user => {
      if (!user) {
        this.nav.setRoot(LoginPage);
      }
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
