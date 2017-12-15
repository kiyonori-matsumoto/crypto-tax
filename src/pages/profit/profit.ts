import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular';
import { HelpPage } from '../help/help';
import { Subject } from 'rxjs';
import { ZaifProvider } from '../../providers/zaif/zaif';
import { TradeAggregateProvider } from '../../providers/trade-aggregate/trade-aggregate';

import * as moment from 'moment';
import { KeyRegistrationComponent } from '../../components/key-registration/key-registration';
/**
 * Generated class for the ProfitPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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

  private readonly providers = {
    'zaif': this.zp,
  }

  constructor(
    public navCtrl: NavController,
    public zp: ZaifProvider,
    private AmCharts: AmChartsService,
    private agg: TradeAggregateProvider,
    private modal: ModalController,
  ) {
    const token = this.zp.restoreTokens()
    if (token) {
      this.connectZaif()
    }
    this.loadingFunds.next(false);
  }

  public connectZaif() {
    // this.zp.saveTokens(this.zaif_key, this.zaif_secret)
    setTimeout(() => {
      this.zp.agg$
      .do(console.log)
      .subscribe(data => {
        this.totalCryptoProfit = data.find(e => e.currency_pair === 'Total').profit;
        this.aggregate = data;
      })

      this.zp.connect();
      
    }, 100);
  }

  open(provider: string) {
    const m = this.modal.create(KeyRegistrationComponent, {
      'provider': provider,
      'key': this.zp.key,
      'secret': this.zp.secret
    })
    m.onDidDismiss((data, role) => {
      const p = this.providers[provider];
      if (data) {
        console.log(data)
        this.zp.saveTokens(data.key, data.secret)
        this.refreshAgg();
        this.connectZaif();
      }
    })
    m.present();
  }

  refreshAgg() {
    this.zp.updateAggregateHistory();
  }

}
