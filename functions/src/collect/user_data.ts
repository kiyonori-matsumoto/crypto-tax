import * as functions from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import * as admin from 'firebase-admin'
import { Bitflyer } from 'bitflyer-promise/dist';
import { V2Private } from 'zaif-promise/dist';
import * as moment from 'moment';

const markets = ['BTC_JPY', 'FX_BTC_JPY', 'ETH_BTC', 'BCH_BTC', 'BTCJPY_MAT1WK', 'BTCJPY_MAT2WK'];

export function user_data(message: functions.Event<Message>): any {
  const data = JSON.parse(Buffer.from(message.data.data, 'base64').toString()); //JSON.parse(message.data.data);
  // console.log(data);
  const uid = data.id;
  const latest_price = data.latest_prices;

  const bitflyer = (data.token.bitflyer) ? new Bitflyer(data.token.bitflyer.key, data.token.bitflyer.secret) : null;

  const zaif = (data.token.zaif) ? new V2Private(data.token.zaif.key, data.token.zaif.secret) : null;

  function make_balance() {
    const balance = admin.firestore().collection('users').doc(uid).collection('balance');
  
    return Promise.all([
      bitflyer_info(),
      zaif_info(),   
    ])
    .then(([bf, zf]) => {
      const time = moment().unix();
      return balance.add({
        time: time,
        bitflyer: bf,
        zaif: zf,
      });
    })
  }
  
  function bitflyer_info() {
    if (!bitflyer) return Promise.resolve([]);
    
    return bitflyer.balance()
    .then(data_1 => data_1
      .filter(d => d.amount > 0)
      .map(d => { return {
        currency: d.currency_code,
        amount: d.amount,
        price: d.currency_code.toUpperCase() === 'JPY' ?
          d.amount : d.amount * parseFloat(latest_price[d.currency_code.toUpperCase()]),
      }}))
  }
  
  function zaif_info() {
    if (!zaif) return Promise.resolve([]);

    return zaif.get_info().then(data_1 => {
      return Object.keys(data_1.funds).map(e => {
        return {
          currency: e.toUpperCase(),
          amount: data_1.funds[e],
          price: e.toUpperCase() === 'JPY' ? 
            data_1.funds[e] : data_1.funds[e] * latest_price[e.toUpperCase()]
        }
      })
    });
  }
  
  function bitflyer_history() {
    const N = 100;
    function execute(pair, id, history_sum = []) {
      return bitflyer.get_executions({
        product_code: pair,
        after: id,
        count: N,
      })
      .then(history => {
        const adds = history.map((e: any) => {
          e.exec_date = moment(e.exec_date).unix();
          delete(e.child_order_id);
          delete(e.child_order_acceptance_id);
          return e;
        })

        const sum = history_sum.concat(adds);
        const len = history.length;
        if (len === N) {
          return execute(pair, history[0].id, sum);
        } else {
          console.log(sum);
          return sum;
        }
      })
    }
    
    // const last_history_query = market => admin.firestore().collection('users').doc(uid).collection('bitflyer_histories').where('market', '==', market).orderBy('time', 'desc').limit(1).get();
    const last_history_query = admin.firestore().collection('users').doc(uid).collection('bitflyer_histories').orderBy('time', 'desc').limit(1).get();

    return last_history_query.then(history => {
      const id = history.size === 0 ? 1 : history.docs[0].data().id;
      return Promise.all(markets.map(pair => execute(pair, id)));
    })

    // return Promise.all(markets.map(m => last_history_query(m)))
    // .then(histories => 
    //   Promise.all(histories.filter(e => e.size !== 0)
    //     .map(history => {
    //       const id = history.docs[0].data().id;
    //       const pair = history.docs[0].data().market;
    //       return execute(pair, id);
    //     })
    //   )
    // )
  }
  
  return Promise.all([
    make_balance(),
    bitflyer_history(),
  ])
}
