import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/publishReplay'

/*
  Generated class for the LatestPriceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LatestPriceProvider {

  private readonly latestPriceSubject = new Subject<any>();
  public readonly latestPrice$: Observable<any>;

  constructor(
    private afs: AngularFirestore,
  ) {
    console.log('Hello LatestPriceProvider Provider');
    this.latestPrice$ = this.afs.collection('latest_prices').valueChanges()
  }

}
