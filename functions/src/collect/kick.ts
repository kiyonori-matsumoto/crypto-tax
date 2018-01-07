import * as functions from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import * as admin from 'firebase-admin'
import * as PubSub from '@google-cloud/pubsub'

export function kick(message: functions.Event<Message>): any {
  
  const pubsub = PubSub();
  const topic = pubsub.topic('collect')
  const publisher = topic.publisher();

  return Promise.all([
    admin.firestore().collection('latest_prices').get(),
    admin.firestore().collection('users').get()
  ])
  .then(([latest_prices, snapshot]) => {
    // latest_prices = latest_prices.docs.map
    const lp: any = latest_prices.docs.reduce((a, e) => { a[e.id] = e.data().price; return a; }, {});
    const requests = snapshot.docs.map(e => Object.assign({}, {id: e.id, token: e.data(), latest_prices: lp}));
    return Promise.all(requests.map(req => publisher.publish(new Buffer(JSON.stringify(req)))))
  })
}
