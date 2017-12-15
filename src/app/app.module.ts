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
  ]
})
export class AppModule {}
