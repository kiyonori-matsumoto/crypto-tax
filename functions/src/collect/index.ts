import * as functions from 'firebase-functions';
import { Message } from 'firebase-functions/lib/providers/pubsub';
import * as admin from 'firebase-admin'
import * as PubSub from '@google-cloud/pubsub'

import * as express from 'express';
import * as cors from 'cors';
import * as compression from 'compression';
import * as moment from 'moment';

export const app = express();

const pubsub = PubSub({});
const topic = pubsub.topic('collect', {})
const publisher = topic.publisher();

app.use(compression());
app.use(cors());

app.post('/update', (req, res, next) => {
  return Promise.all([
    admin.firestore().collection('latest_prices').get(),
    admin.firestore().collection('users').doc(req.body.uid).get()
  ])
  .then(([latest_prices, snapshot]) => {
    // latest_prices = latest_prices.docs.map
    const lp: any = latest_prices.docs.reduce((a, e) => { a[e.id] = e.data().price; return a; }, {});
    const requests = [snapshot].map(e => Object.assign({}, {id: e.id, token: e.data(), latest_prices: lp}));
    return Promise.all(requests.map(r => publisher.publish(new Buffer(JSON.stringify(r)))))
  })
  .then(() => res.status(204).send())
  .catch(next);
})

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const error = err || {message: 'Fatal Error'};
  res.status(status).json(error);
})
