import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subject, Observable } from 'rxjs';

import 'rxjs/add/operator/publishReplay'

/*
  Generated class for the LatestPriceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LatestPriceProvider {

  private readonly latestPriceSubject = new Subject<ILatestPrice[]>();
  public readonly latestPrice$: Observable<ILatestPrice[]>;

  constructor(
    private afs: AngularFirestore,
  ) {
    console.log('Hello LatestPriceProvider Provider');
    this.latestPrice$ = this.afs.collection<ILatestPrice>('latest_prices').valueChanges()
  }
}

export interface ILatestPrice {
  available_supply?: number;
  market_cap?: number;
  max_supply?: number;
  price: number;
  symbol: string;
  time: number;
  total_supply?: number;
  volume_24h?: number;
}
