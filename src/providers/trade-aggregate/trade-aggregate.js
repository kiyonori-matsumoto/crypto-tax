var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import * as dl from 'datalib';
/*
  Generated class for the TradeAggregateProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
var TradeAggregateProvider = (function () {
    function TradeAggregateProvider() {
        console.log('Hello TradeAggregateProvider Provider');
    }
    TradeAggregateProvider.prototype.calculate = function (trades) {
        var summary = dl.groupby('currency_pair', 'your_action').summarize([{ name: 'total', get: function (d) { return d.amount * d.price; }, ops: ['sum'] }, { name: 'amount', get: function (d) { return d.amount; }, ops: ['sum'] }]).execute(trades);
        var amount = function (currency_pair, action) {
            var d = summary.find(function (e) { return e.currency_pair === currency_pair && e.your_action === action; });
            if (d)
                return d.sum_amount;
            return 0;
        };
        var total = function (currency_pair, action) {
            var d = summary.find(function (e) { return e.currency_pair === currency_pair && e.your_action === action; });
            if (d)
                return d.sum_total;
            return 0;
        };
        console.log(summary);
        var currency_pairs = dl.unique(summary, function (d) { return d.currency_pair; });
        return currency_pairs.map(function (pair) {
            var avg_bid = total(pair, 'bid') / amount(pair, 'bid') || 0;
            var avg_ask = total(pair, 'ask') / amount(pair, 'ask') || 0;
            var avg_diff = avg_ask - avg_bid;
            var profit = avg_diff * amount(pair, 'ask'); // 売却数量で掛け算する
            return {
                currency_pair: pair,
                profit: profit
            };
        });
    };
    TradeAggregateProvider = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [])
    ], TradeAggregateProvider);
    return TradeAggregateProvider;
}());
export { TradeAggregateProvider };
//# sourceMappingURL=trade-aggregate.js.map