import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { PipesModule } from '../pipes/pipes.module';
import { ListPage } from '../pages/list/list';
import { HelpPage } from '../pages/help/help';
// import { ProfitPage } from '../pages/profit/profit';

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
import { HomePageModule } from '../pages/home/home.module';
import { ProfitPageModule } from '../pages/profit/profit.module';
import { TabsPageModule } from '../pages/tabs/tabs.module';
import { TaxPageModule } from '../pages/tax/tax.module';
import { LoginPageModule } from '../pages/login/login.module';
import { MarketsProvider } from '../providers/markets/markets';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { GtagProvider } from '../providers/gtag/gtag';

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
    ListPage,
    HelpPage,
    // ProfitPage,
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
    TabsPageModule,
    HomePageModule,
    TaxPageModule,
    LoginPageModule,
    ProfitPageModule,
    PipesModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ListPage,
    HelpPage,
    // ProfitPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GoogleAnalytics,
    ZaifProvider,
    SecureStorage,
    TradeAggregateProvider,
    BitflyerProvider,
    LatestPriceProvider,
    MarketsProvider,
    GtagProvider,
  ]
})
export class AppModule {}
