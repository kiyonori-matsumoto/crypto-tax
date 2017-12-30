import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { HelpPage } from '../pages/help/help';
import { TabsPage } from '../pages/tabs/tabs';
import { ProfitPage } from '../pages/profit/profit';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ZaifProvider } from '../providers/zaif/zaif';
import { SecureStorage } from '@ionic-native/secure-storage';
import { HttpClientModule } from '@angular/common/http';
import { AmChartsModule } from '@amcharts/amcharts3-angular';
import { TradeAggregateProvider } from '../providers/trade-aggregate/trade-aggregate';
import {ComponentsModule} from '../components/components.module'
import { HttpModule, JsonpModule } from '@angular/http';
import { BitflyerProvider } from '../providers/bitflyer/bitflyer';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { LatestPriceProvider } from '../providers/latest-price/latest-price';
import { TaxPageModule } from '../pages/tax/tax.module';
import { LoginPageModule } from '../pages/login/login.module';
import { MarketsProvider } from '../providers/markets/markets';

export const firebaseConfig = {
  apiKey: "AIzaSyDUq-Sp1w1OnluZgDzBwYjUlxzf5-k8Ses",
  authDomain: "crypto-currency-tax.firebaseapp.com",
  databaseURL: "https://crypto-currency-tax.firebaseio.com",
  projectId: "crypto-currency-tax",
  storageBucket: "crypto-currency-tax.appspot.com",
  messagingSenderId: "363305899340"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    HelpPage,
    TabsPage,
    ProfitPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    JsonpModule,
    AmChartsModule,
    ComponentsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    TaxPageModule,
    LoginPageModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    HelpPage,
    TabsPage,
    ProfitPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ZaifProvider,
    SecureStorage,
    TradeAggregateProvider,
    BitflyerProvider,
    LatestPriceProvider,
    MarketsProvider,
  ]
})
export class AppModule {}
