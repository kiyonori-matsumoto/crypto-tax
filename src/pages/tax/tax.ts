import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ZaifProvider } from '../../providers/zaif/zaif';
import { BitflyerProvider } from '../../providers/bitflyer/bitflyer';
import { Observable } from 'rxjs';

/**
 * Generated class for the TaxPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-tax',
  templateUrl: 'tax.html',
})
export class TaxPage {

  totalCryptoProfit: string = "0";
  incomes = {miscellaneous: "0", other: "0"}

  public readonly PROVIDERS = {
    'zaif': this.zp,
    'bitflyer': this.bfp,
  }
  public readonly object = Object;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public zp: ZaifProvider,
    public bfp: BitflyerProvider,
  ) {
    Observable.combineLatest(
      this.zp.agg$, this.bfp.agg$
    ).subscribe(aggs => {
      this.totalCryptoProfit = (aggs.reduce((a, e) => e.find(_e => _e.currency_pair === 'Total').profit + a, 0)).toString(10);
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TaxPage');
  }

  totalProfit() {
    return (parseInt(this.incomes.miscellaneous) + parseInt(this.incomes.other)) * 10000 +
      parseInt(this.totalCryptoProfit)
  }

  calcTaxRate() {
    const misc = parseInt(this.incomes.miscellaneous) * 10000;
    const other = parseInt(this.incomes.other) * 10000;
    if (misc + parseInt(this.totalCryptoProfit) < 200000) {
      return 0;
    }
    const profit = this.totalProfit();
    if (profit > 40000000) return 0.45;
    if (profit > 18000000) return 0.4;
    if (profit >  9000000) return 0.33;
    if (profit >  6950000) return 0.23;
    if (profit >  3300000) return 0.2;
    if (profit >  1950000) return 0.1;
    return 0.05;
  }

}
