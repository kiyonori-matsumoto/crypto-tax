import { HttpClient } from '@angular/common/http';
import { Jsonp, Request } from '@angular/http'
import { Injectable } from '@angular/core';
import * as zaif from 'zaif-promise';
import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import * as moment from 'moment';
import { TradesBaseProvider } from '../trades-base/trades-base';
import { TradeAggregateProvider, AggregateInterface } from '../trade-aggregate/trade-aggregate';
import * as Lock from 'async-lock';
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
    private secureStorage: SecureStorage,
    private agg: TradeAggregateProvider
  ) {
    super()
    console.log('Hello ZaifProvider Provider');
    // this.z = new zaif.V2Private()
    this.connect();
  }

  saveTokens(key: string, secret: string) {
    // if (!this.storage) {
    //   throw "storage is not";
    // }
    this.key = key;
    this.secret = secret;
    // this.z.set_credentials(key, secret);
    // return this.storage.set('zaif_key', JSON.stringify({key, secret}))
    return localStorage.setItem('zaif_key', JSON.stringify({key, secret}));
  }

  restoreTokens() {
    // if (!this.storage) {
      
    // }
    // return this.storage.get('zaif_key')
    // .then(keyStr => JSON.parse(keyStr))
    // .then(key => {
    //   zaif.setCredentials(key.key, key.secret);
    //   return key;
    // })
    const tokens = JSON.parse(localStorage.getItem('zaif_key'));
    if (tokens) {
      // this.z.set_credentials(tokens.key, tokens.secret);
      this.key = tokens.key;
      this.secret = tokens.secret;
    }
    return tokens;
  }

  getInfo() {
    // return this.z.get_info();
    return this.lock.acquire(this.key, () => {
      return this.http.post(this.URL_PRIVATE +  '/info', {
        key: this.key,
        secret: this.secret
      }).toPromise();
    });
  }

  getLatestPrice(currency: string) {
    // return zaif.Public.last_price(`${currency.toLowerCase()}_jpy`);
    return this.http.get(`${this.URL_PUBLIC}/latest_price/${currency.toLowerCase()}_jpy`)
    .do(console.log)
    .toPromise();
  }

  getTradeHistory(from: number = 0, to: number = 0, is_token: boolean = false) {
    return this.lock.acquire(this.key, () => {
      return this.http.post(this.URL_PRIVATE + '/trade_history', {
        key: this.key,
        secret: this.secret,
        from, to, is_token
      }).toPromise();
    });
    // const n = 500

    // const execute = (history, history_sum = {}) => {
    //   history_sum = Object.assign({}, history, history_sum)
    //   let len
    //   if ((len = Object.keys(history).length) == n) {
    //     return this.z.trade_history({
    //       is_token: is_token,
    //       end: to,
    //       from_id: parseInt(Object.keys(history)[len-1]),
    //       count: n
    //     }).then(history => {
    //       return execute(history, history_sum);
    //     })
    //   } else {
    //     return history_sum;
    //   }
    // }

    // if(!to) {
    //   to = moment().endOf('year').unix();
    // }
    // return this.z.trade_history({
    //   since: from,
    //   end: to,
    //   is_token: is_token,
    //   count: n,
    // }).then(history => {
    //   return execute(history);
    // })
  }

  getFundsAsJpy(update: boolean = false) {
    if ((localStorage.getItem('zaif_funds')) && !update) {
      const d = localStorage.getItem('zaif_funds');
      return Promise.resolve(JSON.parse(d));
    }
    return this.getInfo()
    .then((info: any) => {
      return Promise.all(Object.entries(info.funds)
        .map(e => {
          let jpy_async = null;
          if (! e[0].match(/jpy/i)) {
            return this.getLatestPrice(e[0])
            .then(f => f.last_price * e[1] || 0)
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
  }

  aggregateTradeHistory(update = false): Promise<AggregateInterface[]> {
    if (localStorage.getItem('zaif_trades') && !update) {
      const d = localStorage.getItem('zaif_trades');
      return Promise.resolve(JSON.parse(d));
    }
    return this.getTradeHistory(moment().startOf('year').unix(), moment().endOf('year').unix(), false)
    .then(e1 => {
      return this.getTradeHistory(moment().startOf('year').unix(), moment().endOf('year').unix(), true)
      .then(e2 => {
        const trades = Object.values(e1).concat(Object.values(e2));
        const aggregate = this.agg.calculate(trades)
        // this.text = JSON.stringify(aggregate);
        const total = aggregate.reduce((a, e) => a + e.profit, 0);
        aggregate.push({currency_pair: 'Total', profit: total})
        localStorage.setItem('zaif_trades', JSON.stringify(aggregate));
        return aggregate;
      })
    })
  }
}
