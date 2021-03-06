import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TradesBaseProvider, FundsInterface } from '../trades-base/trades-base';

import * as Lock from 'async-lock';
import { AggregateInterface, TradeAggregateProvider } from '../trade-aggregate/trade-aggregate';
import * as moment from 'moment';
import * as firebase from 'firebase'
import { AngularFirestore } from 'angularfire2/firestore';
import { LatestPriceProvider, ILatestPrice } from '../latest-price/latest-price';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs';

/*
  Generated class for the BitflyerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BitflyerProvider extends TradesBaseProvider {

  public name = 'bitflyer';
  public key: string;
  public secret: string;
  lock = new Lock();

  private readonly URL = 'https://us-central1-crypto-currency-tax.cloudfunctions.net'
  private readonly URL_PRIVATE = this.URL + '/bitflyer';

  private readonly MARKETS = ['BTC_JPY', 'FX_BTC_JPY', 'ETH_BTC', 'BCH_BTC']

  constructor(
    public http: HttpClient,
    protected afs: AngularFirestore,
    protected agg: TradeAggregateProvider,
    protected lpp: LatestPriceProvider,
    protected afAuth: AngularFireAuth,
  ) {
    super(afs, afAuth);
    console.log('Hello BitflyerProvider Provider');
  }

  getInfo() {
    // return this.z.get_info();
    return this.lock.acquire(this.key, () => {
      return this.http.post(this.URL_PRIVATE + '/info', {
        key: this.key,
        secret: this.secret
      }).toPromise();
    });
  }

  getLatestPrice(currency: string) {
    return this.afs.collection('latest_prices').doc(currency.toUpperCase()).valueChanges()
      .take(1)
      .toPromise();
  }

  getTradeHistory(currency_pair: string, from: number = 0, to: number = 0) {
    return this.lock.acquire(this.key, () => {
      return this.http.post(this.URL_PRIVATE + '/trade_history', {
        key: this.key,
        secret: this.secret,
        from, to, currency_pair
      }).toPromise();
    });
  }


  getFundsAsJpy(update: boolean = false) {
    if ((localStorage.getItem('bitflyer_funds')) && !update) {
      const d = localStorage.getItem('bitflyer_funds');
      return Promise.resolve(JSON.parse(d));
    }

    return this.lpp.latestPrice$
      .mergeMap<ILatestPrice[], FundsInterface[]>(latest_prices => {
        return Observable.fromPromise(this.getInfo()
          .then((info: any) => {
            return Promise.all(info
              .map(e => {
                let jpy_async = null;
                if (!e.currency_code.match(/jpy/i)) {
                  return (latest_prices &&
                    latest_prices.find(f => f.symbol === e.currency_code.toUpperCase()) &&
                    latest_prices.find(f => f.symbol === e.currency_code.toUpperCase()).price * e.amount)
                    || 0;
                  // return this.getLatestPrice(e[0])
                  // .then((f: any) => f.price * e.amount || 0)
                } else {
                  return e.amount;
                }
              })
            )
              .then((prices: any[]) => {
                const ret = info
                  .map((e, idx) => {
                    const price = <number>prices[idx];
                    return {
                      currency: e.currency_code,
                      price: Math.round(price),
                    }
                  }).sort((a, b) => b.price - a.price)

                localStorage.setItem('bitflyer_funds', JSON.stringify(ret));

                return ret;
              })
          })
        )
      })
  }

  aggregateTradeHistory(update = false, start = moment().startOf('year'), end = moment().endOf('year')): Promise<AggregateInterface[]> {
    if (localStorage.getItem('bitflyer_trades') && !update) {
      const d = localStorage.getItem('bitflyer_trades');
      return Promise.resolve(JSON.parse(d));
    }
    return Promise.all(this.MARKETS.map(market => {
      return this.getTradeHistory(market, start.unix(), end.unix())
        .then(data => data.map(f => {
          f.currency_pair = market.toLowerCase()
          return f
        }))
    }))
      .then(execution_array => {
        const trades = [].concat(...execution_array)
          .sort((t1, t2) => t1.id < t2.id ? -1 : 1)
          .map(t => {
            return {
              action: t.side === 'BUY' ? 'bid' : 'ask',
              currency_pair: t.currency_pair,
              price: t.price,
              amount: t.size,
            }
          })
        console.log(trades)
        const aggregate = this.agg.calculate(trades).map(e => {
          e.profit = e.profit;
          return e;
        })
        const total = aggregate.reduce((a, e) => a + e.profit, 0);
        aggregate.push({ currency_pair: 'Total', profit: total })
        localStorage.setItem('bitflyer_trades', JSON.stringify(aggregate));
        return aggregate;
      })
  }
}
