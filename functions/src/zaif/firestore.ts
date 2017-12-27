import * as moment from 'moment';
import {Public} from 'zaif-promise'
import * as functions from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import * as admin from 'firebase-admin'

const ZAIF_TOKENS = 'ZAIF XCP BITCRYSTALS SJCX FSCC PEPECASH CICC NCXC JPYZ MOSAIC.CMS ERC20.CMS'.split(' ')

export function update_price(message: functions.Event<Message>): any {
  const now = moment().valueOf();
  const batch = admin.firestore().batch();

  return Promise.all(ZAIF_TOKENS.map(symbol => {
    return Public.last_price(`${symbol.toLowerCase()}_jpy`)
    .then(price => {
      const doc = {
        symbol: symbol,
        price: price.last_price,
        time: now,
      }
      return batch.set(admin.firestore().collection('latest_prices').doc(symbol), doc)
    })
  }))
  .then(() => batch.commit());
}
