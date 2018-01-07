import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/publishReplay';
import { AggregateInterface } from '../trade-aggregate/trade-aggregate';
import * as moment from 'moment';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

/*
  Generated class for the TradesBaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export abstract class TradesBaseProvider {

  key    = '';
  secret = '';

  constructor(
    protected afs: AngularFirestore,
    protected afAuth: AngularFireAuth,
  ) {
    console.log('Hello TradesBaseProvider Provider');
  }

  public async connect() {
    const token = await this.restoreTokens();
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

  public saveTokens(key: string, secret: string) {
    this.key = key;
    this.secret = secret;
    localStorage.setItem(`${this.name}_key`, JSON.stringify({key, secret}));
    const uid = this.afAuth.auth.currentUser.uid;
    const doc: any = {}
    doc[this.name] = {key, secret};
    return this.afs.collection('users').doc(uid).set(doc, {merge: true});
  }

  public async restoreTokens() {
    const user = await this.afAuth.authState.take(1).toPromise();
    const token = user ? await this.afs.collection('users').doc<{[id: string]: {key: string, secret: string}}>(user.uid).valueChanges().take(1).toPromise() : {};
    if (token && token[this.name]) {
      this.key = token[this.name].key;
      this.secret = token[this.name].secret;
      return token[this.name];
    } else {
      return null;
    }
  }

  public abstract name: string;

  public abstract getFundsAsJpy(update: boolean):
    Promise<FundsInterface[]> | Observable<FundsInterface[]>;
  public abstract aggregateTradeHistory(update?: boolean, start?: moment.Moment, end?: moment.Moment):
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
    const d = this.aggregateTradeHistory(update, moment().year(2017).startOf('year'), moment().year(2017).endOf('year'));
    if (d instanceof Promise) {
      return d.then(e => {
        this.aggSubject.next(e);
        return e;
      })
    } else {
      const e = d.share();
      e.subscribe(d => this.aggSubject.next(d));
      return e.take(1).toPromise();
    }
  }
}

export interface FundsInterface {
  currency: string;
  price: string;
}
