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
      if (!token.key || !token.secret) {
        return Promise.reject(new Error('key and secret must be provided'));
      }
      return Promise.all([
        this.updateFundsAsJpy(false)
        .then(e => this.fundsSubject.next(e)),
        this.updateAggregateHistory(false)
        .then(e => this.aggSubject.next(e)),
      ]);
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
    Promise<FundsInterface[]> | Observable<FundsInterface[]>;
  public abstract aggregateTradeHistory(update: boolean):
    Promise<AggregateInterface[]> | Observable<AggregateInterface[]>;

  public updateFundsAsJpy(update = true): Promise<any> {
    const d = this.getFundsAsJpy(update);
    if (!d) return null;
    if (d instanceof Promise) {
      return d.then(e => {
        this.fundsSubject.next(e);
        return e;
      })
    } else {
      const e = d.share();
      e.subscribe(d => this.fundsSubject.next(d));
      return e.take(1).toPromise();
    }
  }

  public updateAggregateHistory(update = true): Promise<any> {
    const d = this.aggregateTradeHistory(update)
    if (d instanceof Promise) {
      return d.then(e => {
        this.aggSubject.next(e);
        return e;
      })
    } else {
      const e = d.share();
      e.subscribe(this.aggSubject)
      return e.take(1).toPromise();
    }
  }
}

export interface FundsInterface {
  currency: string;
  price: string;
}
