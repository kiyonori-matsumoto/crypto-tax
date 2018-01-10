import * as functions from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import * as admin from 'firebase-admin'
import { Bitflyer } from 'bitflyer-promise/dist';
import { Coincheck } from 'coincheck-promise';
import { V2Private, Leverage } from 'zaif-promise/dist';
import * as moment from 'moment';

const markets = ['BTC_JPY', 'FX_BTC_JPY', 'ETH_BTC', 'BCH_BTC', 'BTCJPY_MAT1WK', 'BTCJPY_MAT2WK'];

function* each_slice<T>(array: T[], n: number) {
  const len = array.length;
  for(let from=0; from<len; from+=n) {
    let to = from + n;
    if (to > len) { to = len; }
    yield array.slice(from, to);
  }
}

export function user_data(message: functions.Event<Message>): any {
  const data = JSON.parse(Buffer.from(message.data.data, 'base64').toString()); //JSON.parse(message.data.data);
  // console.log(data);
  const uid = data.id;
  const latest_price = data.latest_prices;

  data.token = data.token ? data.token : {}

  const bitflyer = (data.token.bitflyer) ? new Bitflyer(data.token.bitflyer.key, data.token.bitflyer.secret) : null;

  const zaif = (data.token.zaif) ? new V2Private(data.token.zaif.key, data.token.zaif.secret) : null;

  const zaif_leverage = (data.token.zaif) ? new Leverage(data.token.zaif.key, data.token.zaif.secret) : null;

  const coincheck = (data.token.coincheck) ? new Coincheck(data.token.coincheck.key, data.token.coincheck.secret): null;

  function make_balance() {
    const balance = admin.firestore().collection('users').doc(uid).collection('balance');
  
    return Promise.all([
      bitflyer_info(),
      zaif_info(),
      coincheck_info(),
    ])
    .then(([bf, zf, cc]) => {
      const time = moment().unix();
      return balance.add({
        time: time,
        bitflyer: bf,
        zaif: zf,
        coincheck: cc,
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

  function coincheck_info() {
    if (!coincheck) return Promise.resolve([]);

    return coincheck.Private.balances().then(balance =>
      Object.keys(balance)
      .filter(e => !e.includes('_'))
      .map(e => {
        const currency = e.toUpperCase();
        const amount = Number(balance[e]);
        return {
          currency: currency,
          amount: amount,
          price: currency === 'JPY' ? amount : amount * latest_price[currency]
        }
      })
    )
  }
  
  function bitflyer_history() {
    if (!bitflyer) return Promise.resolve([]);

    const N = 100;
    function execute(pair, id, history_sum = []): Promise<any[]> {
      return bitflyer.get_executions({
        product_code: pair,
        after: id,
        count: N,
      })
      .then(history => {
        const adds = history.map((e: any) => {
          e.market = pair;
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
          return sum;
        }
      })
    }

    const batch = admin.firestore().batch();
    const ref = admin.firestore().collection('users').doc(uid).collection('bitflyer_history');
    // const last_history_query = market => admin.firestore().collection('users').doc(uid).collection('bitflyer_histories').where('market', '==', market).orderBy('time', 'desc').limit(1).get();
    const last_history_query = ref.orderBy('exec_date', 'desc').limit(1).get();

    return last_history_query.then(history => {
      const id = history.size === 0 ? 1 : history.docs[0].data().id;
      console.log(`bitflyer id=${id}`);
      return Promise.all(markets.map(pair => execute(pair, id)));
    })
    .then(values => {
      const vs = [].concat(...values)
      const batches = Array.from(each_slice(vs, 500)).map(v => {
        v.forEach(e => {
          // console.log(e);
          batch.set(ref.doc(`${e.id}`), e)
        });
        return batch.commit();
      })
      return Promise.all(batches);
    })
  }

  function zaif_history() {
    if (!zaif) return Promise.resolve([]);

    const N = 1000;
    function execute(is_token, id, history_sum = []): Promise<any[]> {
      return zaif.trade_history({
        is_token,
        from_id: id,
        count: N,
      })
      .then((history) => {
        const adds: TradeHistory[] = Object.keys(history).map(_id => {
          const d = history[_id]
          return {
            id: _id,
            market: d.currency_pair.toUpperCase(),
            side: d.your_action === 'bid' ? 'BUY' : 'SELL',
            price: d.price || 0,
            size: d.amount || 0,
            exec_date: d.timestamp || 0,
            commission: d.fee || 0,
          }
        })

        const sum = history_sum.concat(adds);
        const len = adds.length;
        if (len === N) {
          return execute(is_token, adds[len-1].id, sum);
        } else {
          return sum;
        }
      })
    }

    const ref = admin.firestore().collection('users').doc(uid).collection('zaif_history');

    const last_history_query = ref.orderBy('exec_date', 'desc').limit(1).get();

    return last_history_query.then(history => {
      const id = history.size === 0 ? 0 : history.docs[0].data().id;
      console.log(`zaif id=${id}`);
      return Promise.all([true, false].map(is_token => execute(is_token, id)));
    })
    .then(values => {
      const vs = [].concat(...values)
      const batches = Array.from(each_slice(vs, 500)).map(v => {
        const batch = admin.firestore().batch();
        v.forEach(e => {
          // console.log(e);
          batch.set(ref.doc(`${e.id}`), e)
        });
        return batch.commit();
      })
      return Promise.all(batches);
    })
  }
  
  function zaif_history_leverage() {
    if (!zaif_leverage) return Promise.resolve([]);

    const N = 1000;
    function execute(id, history_sum=[]): Promise<any[]> {
      return zaif_leverage.get_positions({
        type: 'margin',
        from_id: id,
        count: N
      }).then(history => {
        const adds: any[] = Object.keys(history).map(_id => {
          return Object.assign({id: _id}, history[_id]);
        })
        const sum = history_sum.concat(adds);
        const len = adds.length;
        if (len === N) {
          return execute(adds[len-1].id, sum);
        } else {
          return sum;
        }
      })
    }

    const batch = admin.firestore().batch();
    const ref = admin.firestore().collection('users').doc(uid).collection('zaif_history_leverage');

    const last_history_query = ref.where('timestamp_closed', '==', '').orderBy('timestamp', 'asc').limit(1).get();
    const last_history_query2 = ref.orderBy('timestamp', 'desc').limit(1).get();

    return Promise.all([
      last_history_query,
      last_history_query2,
    ]).then(histories => {
      const h = histories.find(_h => _h.size !== 0);
      const id = h ? h.docs[0].data().id : 0;
      console.log(`zaif_leverage id=${id}`);
      return execute(id);
    })
    .then(values => {
      const batches = Array.from(each_slice(values, 500)).map(v => {
        v.forEach(e => {
          // console.log(e);
          batch.set(ref.doc(`${e.id}`), e)
        });
        return batch.commit();
      })
      return Promise.all(batches);
    })
  }

  return Promise.all([
    make_balance(),
    bitflyer_history(),
    zaif_history(),
    zaif_history_leverage(),
  ])
}

export interface TradeHistory {
  id: number | string,
  side: string,
  price: number,
  size: number,
  exec_date: number,
  commission: number,
  market: string,
}
