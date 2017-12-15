import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/publishReplay';
import { AggregateInterface } from '../trade-aggregate/trade-aggregate';

/*
  Generated class for the TradesBaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export abstract class TradesBaseProvider {

  constructor() {
    console.log('Hello TradesBaseProvider Provider');
  }

  public connect() {
    const token = this.restoreTokens();
    if (token) {
      this.getFundsAsJpy(false)
      .then(e => this.fundsSubject.next(e));
      this.aggregateTradeHistory(false)
      .then(e => this.aggSubject.next(e));
    }
  }

  protected fundsSubject: Subject<FundsInterface[]> = new Subject();
  public readonly funds$: Observable<FundsInterface[]> = 
    this.fundsSubject.publishReplay(1).refCount();
  
  protected aggSubject: Subject<AggregateInterface[]> = new Subject();
  public readonly agg$: Observable<AggregateInterface[]> = 
    this.aggSubject.publishReplay(1).refCount();

  public abstract name: string;
  public abstract saveTokens(key: string, secret: string);
  public abstract restoreTokens();
  public abstract getFundsAsJpy(update: boolean):
    Promise<FundsInterface[]>;
  public abstract aggregateTradeHistory(update: boolean):
    Promise<AggregateInterface[]>;

  public updateFundsAsJpy() {
    return this.getFundsAsJpy(true)
    .then(e => this.fundsSubject.next(e));
  }

  public updateAggregateHistory() {
    return this.aggregateTradeHistory(true)
    .then(e => this.aggSubject.next(e));
  }
}

interface FundsInterface {
  currency: string;
  price: string;
}
