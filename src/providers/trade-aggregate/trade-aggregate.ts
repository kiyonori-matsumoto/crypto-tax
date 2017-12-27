import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as dl from 'datalib'
import * as moment from 'moment'

/*
  Generated class for the TradeAggregateProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class TradeAggregateProvider {

  constructor() {
    console.log('Hello TradeAggregateProvider Provider');
  }

  culculate_moving_average(trades: TradesToAggregateInterface[]) : AggregateInterface[] {

    const data = {};
    const profit = {};

    trades.forEach(v => {
      let [a, b] = v.currency_pair.split('_');
      let plus, minus;
      if (v.action == 'bid') {
        plus = a; minus = b;
      } else {
        plus = b; minus = a;
      }

      if (!data[a]) {
        data[a] = {
          amount: 0, average: 0,
        }
      }
      if (!data[b]) {
        data[b] = {
          amount: 0, average: 0,
        }
      }

      if (v.action == 'bid') {
        const t = (data[plus].average * data[plus].amount) + (v.price * v.amount);
        data[plus].amount += v.amount;
        data[plus].average = t / data[plus].amount;
        data[minus].amount -= v.amount * v.price;
      } else {
        if (!profit[v.currency_pair]) { profit[v.currency_pair] = 0; }
        profit[v.currency_pair] += (v.price - data[minus].average) * v.amount;
        data[minus].amount -= v.amount;
        data[plus].amount += v.amount * v.price;
      }
      // console.log(v.currency_pair, data['btc'].amount, data['btc'].average, profit['btc_jpy'])
    });

    return Object.keys(profit).map(k => {
      return {
        currency_pair: k,
        profit: profit[k],
      }
    })

    // let by_currency_pair = dl.groupby('currency_pair').execute(trades);

    // const a = by_currency_pair.map(c => {
    //   // console.log(c.values.length);
    //   let average = 0;
    //   let profit = 0;
    //   let amount = 0;
    //   c.values.forEach(v => {
    //     console.log(average, profit, amount)
    //     if (v.action == 'bid') { // 購入時
    //       const t = (average * amount) + (v.price * v.amount)
    //       amount += v.amount;
    //       average = t / amount;
    //     } else { //売却時
    //       profit += (v.price - average) * v.amount;
    //       amount -= v.amount;
    //     }
    //   })
    //   return {
    //     currency_pair: c.currency_pair,
    //     profit: profit,
    //   }
    // })

    // console.log(a);
    // return a;
  }

  calculate(trades: any[]): AggregateInterface[] {
    return this.culculate_moving_average(trades);
    // let summary = dl.groupby('currency_pair', 'action').summarize([{name: 'total', get: (d) => d.amount * d.price, ops: ['sum']}, {name: 'amount', get: d => d.amount, ops: ['sum']}]).execute(trades)

    // const amount = (currency_pair, action) => {
    //   const d = summary.find(e => e.currency_pair === currency_pair && e.action === action)
    //   if (d) return d.sum_amount;
    //   return 0;
    // }
    // const total = (currency_pair, action) => {
    //   const d = summary.find(e => e.currency_pair === currency_pair && e.action === action)
    //   if (d) return d.sum_total;
    //   return 0;
    // }

    // console.log(summary)

    // const currency_pairs = dl.unique(summary, d => d.currency_pair);

    // return currency_pairs.map(pair => {
    //   const avg_bid = total(pair, 'bid') / amount(pair, 'bid') || 0
    //   const avg_ask = total(pair, 'ask') / amount(pair, 'ask') || 0
    //   const avg_diff = avg_ask - avg_bid;
    //   const profit = avg_diff * amount(pair, 'ask') // 売却数量で掛け算する
    //   return {
    //     currency_pair: pair,
    //     profit
    //   };
    // })
  }
}

export interface AggregateInterface {
  currency_pair: string;
  profit: number;
}

export interface TradesToAggregateInterface {
  action: 'bid'|'ask',
  currency_pair: string,
  price: number,
  amount: number,
}
