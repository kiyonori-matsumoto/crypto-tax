import { HttpClient } from '@angular/common/http';
import { Jsonp, Request } from '@angular/http'
import { Injectable } from '@angular/core';
import * as zaif from 'zaif-promise';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import * as moment from 'moment';
import { TradesBaseProvider, FundsInterface } from '../trades-base/trades-base';
import { TradeAggregateProvider, AggregateInterface } from '../trade-aggregate/trade-aggregate';
import * as Lock from 'async-lock';
import * as firebase from 'firebase'
import { AngularFirestore } from 'angularfire2/firestore';
import { LatestPriceProvider, ILatestPrice } from '../latest-price/latest-price';
import { GetPositionResponse } from 'zaif-promise';
import * as dl from 'datalib'
import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/operator/mergeMap'
import { Observable } from 'rxjs/Observable';

/*
  Generated class for the ZaifProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
// zaif.Config.endpoint = 'http://localhost:8100/api/zaif';

@Injectable()
export class ZaifProvider extends TradesBaseProvider {

  public name = 'zaif';
  // private z: zaif.V2Private;
  private readonly URL = 'https://us-central1-crypto-currency-tax.cloudfunctions.net'
  // private readonly URL = 'http://localhost:5000/crypto-currency-tax/us-central1'
  private readonly URL_PRIVATE = this.URL + '/zaif';
  private readonly URL_PUBLIC = this.URL + '/zaif_public';

  storage: SecureStorageObject = null;
  key: string;
  secret: string;
  lock = new Lock();

  constructor(
    public http: HttpClient,
    public jsonp: Jsonp,
    protected secureStorage: SecureStorage,
    protected afs: AngularFirestore,
    protected agg: TradeAggregateProvider,
    protected lpp: LatestPriceProvider,
    protected afAuth: AngularFireAuth,
  ) {
    super(afs, afAuth)
    console.log('Hello ZaifProvider Provider');
  }

  getInfo() {
    return new Promise((resolve, reject) => {
      this.lock.acquire(this.key, () => {
        return this.http.post(this.URL_PRIVATE +  '/info', {
          key: this.key,
          secret: this.secret
        }).toPromise();
      }, resolve);
    })
  }

  getTradeHistory(from: number = 0, to: number = 0, is_token: boolean = false) {
    return new Promise((resolve, reject) => {
      this.lock.acquire(this.key, () => {
        return this.http.post(this.URL_PRIVATE + '/trade_history', {
          key: this.key,
          secret: this.secret,
          from, to, is_token
        }).toPromise();
      }, resolve);
    })
  }

  getLeverageHistory(from: number = 0, to: number = 0, type: string = 'margin') {
    return this.lock.acquire(this.key, () => {
      return this.http.post(this.URL_PRIVATE + '/leverage_history', {
        key: this.key,
        secret: this.secret,
        from, to, type
      }).toPromise();
    })
  }

  getFundsAsJpy(update: boolean = false) {
    if ((localStorage.getItem('zaif_funds')) && !update) {
      const d = localStorage.getItem('zaif_funds');
      return Promise.resolve(JSON.parse(d));
    }

    return this.lpp.latestPrice$
    .take(1)
    .mergeMap<ILatestPrice[], FundsInterface[]>(latest_prices => {
      return Observable.fromPromise(this.getInfo()
      .then((info: any) => {
        return Promise.all(Object.entries(info.funds)
          .map(e => {
            if (! e[0].match(/jpy/i)) {
              return (latest_prices &&
                latest_prices.find(f => f.symbol === e[0].toUpperCase()) &&
                latest_prices.find(f => f.symbol === e[0].toUpperCase()).price * e[1])
                || 0;
              // return f && f.price * e[1] || 0
            } else {
              return e[1];
            }
          })
        )
        .then((prices: any[]) => {
          const ret = Object.entries(info.funds)
          .map((e, idx) => {
            const price = <number>prices[idx];
            return {
              currency: e[0],
              price: Math.round(price),
            }
          }).sort((a, b) => b.price - a.price)

          localStorage.setItem('zaif_funds', JSON.stringify(ret));

          return ret;
        })
      })
    )})
  }

  aggregateTradeHistory(update = false, start = moment().startOf('year'), end = moment().endOf('year')): Promise<AggregateInterface[]> {
    if (localStorage.getItem('zaif_trades') && !update) {
      const d = localStorage.getItem('zaif_trades');
      return Promise.resolve(JSON.parse(d));
    }
    return this.getTradeHistory(start.unix(), end.unix(), false)
    .then(e1 => {
      return this.getTradeHistory(start.unix(), end.unix(), true)
      .then(e2 => {
        return this.aggregateLeverage(update, start, end).then(e3 => {
          const trades = Object.values(e1).concat(Object.values(e2))
          .map(t => { return {
            action: t.your_action,
            currency_pair: t.currency_pair,
            price: t.price,
            amount: t.amount,
          }})
          const aggregate = this.agg.calculate(trades).concat(e3);
          const total = aggregate.reduce((a, e) => a + e.profit, 0);
          aggregate.push({currency_pair: 'Total', profit: total})
          localStorage.setItem('zaif_trades', JSON.stringify(aggregate));
          console.log(aggregate);
          return aggregate;
        })
      })
    })
  }

  private aggregateLeverage(update = false, start = moment().startOf('year'), end = moment().endOf('year')) {
    return this.getLeverageHistory(start.unix(), end.unix(), 'margin')
    .then(e => {
      const trades = Object.values(e)
        .filter(t => t.close_avg && t.amount === t.close_done)
        .map((t: GetPositionResponse) => { return {
          currency_pair: `fx_${t.currency_pair}`,
          profit: t.action === 'ask' ? t.price_avg * t.amount_done - t.close_avg * t.close_done :
            t.close_avg * t.close_done - t.price_avg * t.amount_done
        }})
      const aggregate = trades.reduce((a, e) => {
        a[e.currency_pair] = a[e.currency_pair] || 0;
        a[e.currency_pair] += e.profit;
        return a;
      }, {})
      return Object.entries(aggregate).map(([k, v]) => { return {
        currency_pair: k,
        profit: <number>v,
      }})
    })
  } 
}
