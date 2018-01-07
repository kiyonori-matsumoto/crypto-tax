import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';
import { HelpPage } from '../help/help';
import { Subject } from 'rxjs';
import { ZaifProvider } from '../../providers/zaif/zaif';
import { TradeAggregateProvider } from '../../providers/trade-aggregate/trade-aggregate';

import * as moment from 'moment';
import { KeyRegistrationComponent } from '../../components/key-registration/key-registration';
import { TradesBaseProvider } from '../../providers/trades-base/trades-base';
import { BitflyerProvider } from '../../providers/bitflyer/bitflyer';
import { GtagProvider } from '../../providers/gtag/gtag';
/**
 * Generated class for the ProfitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profit',
  templateUrl: 'profit.html',
})
export class ProfitPage {
  aggregate: any[] = []
  helpPage = HelpPage;
  loadingFunds: Subject<boolean> = new Subject();
  totalCryptoProfit: number = 0;
  incomes = {miscellaneous: 0, other: 0}
  year = '2017';

  public readonly PROVIDERS = {
    'zaif': this.zp,
    'bitflyer': this.bfp,
  }
  public readonly object = Object;

  constructor(
    public navCtrl: NavController,
    public zp: ZaifProvider,
    public bfp: BitflyerProvider,
    private AmCharts: AmChartsService,
    private agg: TradeAggregateProvider,
    private modal: ModalController,
    private alert: AlertController,
    private gtag: GtagProvider,
  ) {
    Object.entries(this.PROVIDERS).forEach(async ([k, v]) => {
      const token = await v.restoreTokens();
      if(token) {
        this.connect(k, v)
      }
    })
    this.gtag.pageView('/profit');
  }

  public connect(provider: string, p: TradesBaseProvider) {
    setTimeout(() => {

      p.connect().catch(e => {
        console.log('test', e);
        this.alert.create({title: 'Error', message: e.message, buttons: ['Ok']}).present();
        return false;
      })
      
    }, 100);
  }

  open(provider: string) {
    const m = this.modal.create(KeyRegistrationComponent, {
      'provider': provider,
      'key': this.zp.key,
      'secret': this.zp.secret
    })
    m.onDidDismiss((data, role) => {
      const p = this.PROVIDERS[provider];
      if (data) {
        console.log(data)
        p.saveTokens(data.key, data.secret)
        this.connect(provider, p);
      }
    })
    m.present();
  }

  refreshFunds(p: TradesBaseProvider) {
    this.loadingFunds.next(true);
    p.updateFundsAsJpy()
    .then(() => this.loadingFunds.next(false));
  }

  refreshAgg(p: TradesBaseProvider) {
    p.updateAggregateHistory()
  }

}
