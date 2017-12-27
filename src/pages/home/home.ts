import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ZaifProvider } from '../../providers/zaif/zaif';
import * as zaif from 'zaif-promise';
import { Observable, Subject } from 'rxjs';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular'
import * as moment from 'moment';
import { TradeAggregateProvider } from '../../providers/trade-aggregate/trade-aggregate';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { ListPage } from '../list/list';
import { KeyRegistrationComponent } from '../../components/key-registration/key-registration';
import 'rxjs/add/operator/do'
import { HelpPage } from '../help/help';
import { BitflyerProvider } from '../../providers/bitflyer/bitflyer';
import { TradesBaseProvider } from '../../providers/trades-base/trades-base';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  // zaif_key: string
  // zaif_secret: string;
  // zaif_funds: any = null;
  text: string
  chart: AmChart;
  aggregate: any[] = []
  helpPage = HelpPage;
  loadingFunds: Subject<boolean> = new Subject();
  loadingAggs: Subject<boolean> = new Subject();
  totalCryptoProfit: string = "0";
  incomes = {miscellaneous: "0", other: "0"}

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
  ) {
    Object.entries(this.PROVIDERS).forEach(([k, v]) => {
      const token = v.restoreTokens();
      if(token) {
        this.connect(k, v)
      }
      this.loadingFunds.next(false);
    })
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
      'key': this.PROVIDERS[provider].key,
      'secret': this.PROVIDERS[provider].secret
    })
    m.onDidDismiss((data, role) => {
      const p: TradesBaseProvider = this.PROVIDERS[provider];
      if (data) {
        console.log(data)
        p.saveTokens(data.key, data.secret)
        // this.refreshFunds(p);
        p.updateFundsAsJpy()
        .catch(e => {
          console.log(e);
          this.alert.create({title: 'Error', message: e.message, buttons: ['Ok']}).present();
          return false;
        })
        // this.refreshAgg(p);
        this.connect(provider, p);
      }
    })
    m.present();
  }
}
