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

  calculate(trades: any[]): AggregateInterface[] {
    let summary = dl.groupby('currency_pair', 'your_action').summarize([{name: 'total', get: (d) => d.amount * d.price, ops: ['sum']}, {name: 'amount', get: d => d.amount, ops: ['sum']}]).execute(trades)

    const amount = (currency_pair, action) => {
      const d = summary.find(e => e.currency_pair === currency_pair && e.your_action === action)
      if (d) return d.sum_amount;
      return 0;
    }
    const total = (currency_pair, action) => {
      const d = summary.find(e => e.currency_pair === currency_pair && e.your_action === action)
      if (d) return d.sum_total;
      return 0;
    }

    console.log(summary)

    const currency_pairs = dl.unique(summary, d => d.currency_pair);

    return currency_pairs.map(pair => {
      const avg_bid = total(pair, 'bid') / amount(pair, 'bid') || 0
      const avg_ask = total(pair, 'ask') / amount(pair, 'ask') || 0
      const avg_diff = avg_ask - avg_bid;
      const profit = avg_diff * amount(pair, 'ask') // 売却数量で掛け算する
      return {
        currency_pair: pair,
        profit
      };
    })
  }
}

export interface AggregateInterface {
  currency_pair: string;
  profit: number;
}
