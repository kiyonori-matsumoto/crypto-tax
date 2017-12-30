import { Injectable } from '@angular/core';
import { TradesBaseProvider } from '../trades-base/trades-base';

/*
  Generated class for the MarketsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MarketsProvider {

  private list: TradesBaseProvider[];

  constructor(
  ) {
    console.log('Hello MarketsProvider Provider');
  }

}
