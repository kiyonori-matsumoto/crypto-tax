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
import { IonicPage } from 'ionic-angular/navigation/ionic-page';
import { GoogleAnalytics } from '@ionic-native/google-analytics';
import { GtagProvider } from '../../providers/gtag/gtag';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { HttpClient } from '@angular/common/http';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

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
  public readonly observable = Observable;

  public funds$ : Observable<any[]>;

  constructor(
    public navCtrl: NavController,
    public zp: ZaifProvider,
    public bfp: BitflyerProvider,
    private AmCharts: AmChartsService,
    private agg: TradeAggregateProvider,
    private modal: ModalController,
    private alert: AlertController,
    private gtag: GtagProvider,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private http: HttpClient,
  ) {
    Object.entries(this.PROVIDERS).forEach(([k, v]) => {
      const token = v.restoreTokens();
      if(token) {
        this.connect(k, v)
      }
    })
    console.log(gtag);
    this.gtag.pageView('/home');
    this.funds$ = this.afAuth.authState.filter(u => !!u).map(u => u.uid)
      .mergeMap(uid => this.afs.collection('users').doc(uid).collection('balance', ref => ref.orderBy('time', 'desc').limit(1)).valueChanges()).map(e => Object.entries(e[0]).filter(e => e[0] !== 'time').map(g => g.concat(Object.entries(e[0]).find(f => f[0] === 'time')[1])));
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
        .then(() => {
          this.connect(provider, p);
          this.refresh();
        })
      }
    })
    m.present();
  }

  refresh() {
    return this.http.post('https://us-central1-crypto-currency-tax.cloudfunctions.net/collect/update', 
    {uid: this.afAuth.auth.currentUser.uid}).subscribe(() => console.log('finish update'));
  }
}
