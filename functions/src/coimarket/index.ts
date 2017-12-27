import * as moment from 'moment';
import * as rp from 'request-promise-native';
import * as functions from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import * as admin from 'firebase-admin'

export function coinmarket(message: functions.Event<Message>): any {
  const now = moment().valueOf();
  const batch = admin.firestore().batch();
  return rp.get('https://api.coinmarketcap.com/v1/ticker?convert=JPY', {json: true})
  .then((data: any[]) => {
    data.map(d => {
      return {
        symbol: d.symbol,
        price: d.price_jpy,
        available_supply: d.available_supply,
        total_supply: d.total_supply,
        max_supply: d.max_supply,
        volume_24h: d['24h_volume_jpy'],
        market_cap: d.market_cap_jpy,
        time: now,
      }
    })
    .forEach(d => {
      batch.set(admin.firestore().collection('latest_prices').doc(d.symbol), d);
    })
  })
  .then(() => {
    return batch.commit();
  })
}
