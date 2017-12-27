import {Bitflyer} from 'bitflyer-promise/dist';
import * as express from 'express';
import * as cors from 'cors';
import * as compression from 'compression';
import * as moment from 'moment';

export const app = express();

app.use(compression());
app.use(cors());

app.get('/', (req, res) => {
  res.send('OK');
})

app.post('/trade_history', (req, res, next) => {
  
  const key = req.body.key;
  const secret = req.body.secret;
  const bitflyer = new Bitflyer(key, secret);
  const pair = req.body.currency_pair;
  let   from = parseInt(req.body.from || 0);
  let   to = parseInt(req.body.to || 0);

  const n = 100;

  const execute = (history, history_sum = []) => {
    const adds = history.map(e => {
      e.exec_date = moment(e.exec_date).unix();
      delete(e.child_order_id);
      delete(e.child_order_acceptance_id);
      return e;
    })
    .filter(e => e.exec_date >= from && e.exec_date < to);

    const sum = history_sum.concat(adds);
    const len = history.length
    if (len === n) {
      return bitflyer.get_executions({
        product_code: pair,
        before: history[len-1].id,
        count: n,
      })
      .then(data => {
        return execute(data, sum)
      })
    } else {
      res.send(sum).end();
      return sum;
    }
  }

  if(!from) {
    from = moment().startOf('year').unix();
  }

  if(!to) {
    to = moment().endOf('year').unix();
  }
  return bitflyer.get_executions({
    product_code: pair,
    count: n,
  }).then(history => {
    return execute(history);
  }).catch(next);
})

app.post('/info', (req, res, next) => {
  const bf = new Bitflyer(req.body.key, req.body.secret);
  bf.balance().then(data => res.json(data))
  .catch(next);
})

