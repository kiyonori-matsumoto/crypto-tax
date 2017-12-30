import {Public, V2Private, Leverage} from 'zaif-promise';
import * as express from 'express';
import * as cors from 'cors';
import * as compression from 'compression';
import * as moment from 'moment';

export const app = express();

// app.get('latest_price/:currency_pair', (req, res, next) => {
//   Public.last_price(req.params.currency_pair)
//   .then(d => res.json(d).end())
//   .catch(next)
// })

app.use(compression());
app.use(cors());

app.get('/', (req, res) => {
  res.send('OK');
})

app.post('/trade_history', (req, res, next) => {
  
  const key = req.body.key
  const secret = req.body.secret
  const Private = new V2Private(key, secret);
  const from = parseInt(req.body.from || 0);
  let   to = parseInt(req.body.to || 0);
  const is_token = !!req.body.is_token || false;

  const n = 1000;

  const execute = (history, history_sum = {}) => {
    const sum = Object.assign({}, history, history_sum)
    const len = Object.keys(history).length
    if (len === n) {
      return Private.trade_history({
        is_token: is_token,
        end: to,
        from_id: parseInt(Object.keys(history)[len-1]),
        count: n
      }).then(h => {
        return execute(h, sum);
      })
    } else {
      res.send(sum).end();
      return sum;
    }
  }

  if(!to) {
    to = moment().endOf('year').unix();
  }
  return Private.trade_history({
    since: from,
    end: to,
    is_token: is_token,
    count: n,
  }).then(history => {
    return execute(history);
  }).catch(next);
})

app.post('/leverage_history', (req, res, next) => {
  const leverage = new Leverage(req.body.key, req.body.secret);
  const from = parseInt(req.body.from || 0);
  let   to = parseInt(req.body.to || 0);

  const n = 1000;

  const execute = (history, history_sum = {}) => {
    const sum = Object.assign({}, history, history_sum)
    const len = Object.keys(history).length
    if (len === n) {
      return leverage.get_positions({
        type: 'margin',
        end: to,
        from_id: parseInt(Object.keys(history)[len-1]),
        count: n
      }).then(h => {
        return execute(h, sum);
      })
    } else {
      res.send(sum).end();
      return sum;
    }
  }

  if(!to) {
    to = moment().endOf('year').unix();
  }
  return leverage.get_positions({
    type: 'margin',
    since: from,
    end: to,
    count: n,
  }).then(history => {
    return execute(history);
  }).catch(next);
})

app.post('/info', (req, res, next) => {
  const Private = new V2Private(req.body.key, req.body.secret);
  Private.get_info()
  .then(info => res.json(info).end())
  .catch(next);
})

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const error = err || {message: 'Fatal Error'};
  res.status(status).json(error);
})

export const app2 = express();

app2.use(compression());
app2.use(cors());
app2.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=200, s-maxage=300'); //5 minutes
  next();
})

app2.get('/latest_price/:pair', (req, res, next) => {
  Public.last_price(req.params.pair)
  .then(data => res.json(data))
  .catch(next);
})

app2.use((req, res) => res.status(404).send('Not found'))

app2.use((err, req, res, next) => {
  res.status(500).send(err.message || err || 'fatal');
})
