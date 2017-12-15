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

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  zaif_key: string
  zaif_secret: string;
  zaif_funds: any = null;
  text: string
  chart: AmChart;
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
      this.zaif_key = token.key;
      this.zaif_secret = token.secret;
      this.connectZaif()
    }
    this.loadingFunds.next(false);
  }

  public connectZaif() {
    // this.zp.saveTokens(this.zaif_key, this.zaif_secret)
    setTimeout(() => {
      this.chart = this.AmCharts.makeChart('zaifChart', {
        type: 'pie',
        theme: 'light',
        dataProvider: [],
        valueField: 'price',
        titleField: 'currency',
        groupPercent: 5,
        // labelsEnabled: false,
        labelText: '[[percents]]%',
        autoMargins: false,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        // pullOutRadius: 0,
        labelRadius: -35,
      })
      
      this.zp.funds$
      .subscribe(data => {
        this.zaif_funds = data;
        this.AmCharts.updateChart(this.chart, () => {
          this.chart.dataProvider = data;
        })
        console.log(this.chart)
      });

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
        this.zaif_key = data.key;
        this.zaif_secret = data.secret;
        this.zp.saveTokens(data.key, data.secret)
        this.refreshFunds();
        this.refreshAgg();
        this.connectZaif();
      }
    })
    m.present();
  }

  refreshFunds() {
    this.loadingFunds.next(true);
    this.zp.updateFundsAsJpy()
    .then(() => this.loadingFunds.next(false));
  }
  
  refreshAgg() {
    this.zp.updateAggregateHistory();
  }

  totalProfit() {
    return (this.incomes.miscellaneous + this.incomes.other) * 10000 +
      this.totalCryptoProfit
  }

  calcTaxRate() {
    const misc = this.incomes.miscellaneous * 10000;
    const other = this.incomes.other * 10000;
    if (misc + this.totalCryptoProfit < 200000) {
      return 0;
    }
    const profit = misc + other + this.totalCryptoProfit;
    if (profit > 40000000) return 0.45;
    if (profit > 18000000) return 0.4;
    if (profit >  9000000) return 0.33;
    if (profit >  6950000) return 0.23;
    if (profit >  3300000) return 0.2;
    if (profit >  1950000) return 0.1;
    return 0.05;
  }
}
