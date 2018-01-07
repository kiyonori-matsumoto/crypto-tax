import * as functions from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import * as admin from 'firebase-admin'
import { Bitflyer } from 'bitflyer-promise/dist';
import { V2Private } from 'zaif-promise/dist';
import * as moment from 'moment';

export function user_data(message: functions.Event<Message>): any {
  const data = JSON.parse(Buffer.from(message.data.data, 'base64').toString()); //JSON.parse(message.data.data);
  // console.log(data);
  const uid = data.id;
  const latest_price = data.latest_prices;

  const ref = admin.firestore().collection('users').doc(uid).collection('balance');

  return Promise.all([
    bitflyer_info(data.token.bitflyer, latest_price),
    zaif_info(data.token.zaif, latest_price),   
  ])
  .then(([bf, zf]) => {
    const time = moment().unix();
    return ref.add({
      time: time,
      bitflyer: bf,
      zaif: zf,
    });
  })
}

function bitflyer_info(token: {key: string, secret: string}, latest_price: any) {
  if (!token || !token.key) return Promise.resolve(null);
  const key = token.key;
  const secret = token.secret;
  const bitflyer = new Bitflyer(key, secret);
  return bitflyer.balance()
  .then(data => data
    .filter(d => d.amount > 0)
    .map(d => { return {
      currency: d.currency_code,
      amount: d.amount,
      price: d.currency_code.toUpperCase() === 'JPY' ?
        d.amount : d.amount * parseFloat(latest_price[d.currency_code.toUpperCase()]),
    }}))
}

function zaif_info(token: {key: string, secret: string}, latest_price: any) {
  if (!token || !token.key) return Promise.resolve(null);
  const key = token.key;
  const secret = token.secret;
  const zaif = new V2Private(key, secret);
  return zaif.get_info().then(data => {
    return Object.keys(data.funds).map(e => {
      return {
        currency: e.toUpperCase(),
        amount: data.funds[e],
        price: e.toUpperCase() === 'JPY' ? 
          data.funds[e] : data.funds[e] * latest_price[e.toUpperCase()]
      }
    })
  });
}
