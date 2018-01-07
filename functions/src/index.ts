import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import {app as ZaifApp, app2 as ZaifAppPublic} from './zaif/'
import {app as BitFlyerApp} from  './bitflyer';

import {update_price as zaifMarket} from './zaif/firestore'
import {coinmarket} from './coimarket';

import { kick } from './collect/kick'
import { user_data } from './collect/user_data';
import {app as CollectApp} from './collect';

admin.initializeApp(functions.config().firebase);
// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//
export const zaif = functions.https.onRequest(ZaifApp)
export const zaif_public = functions.https.onRequest(ZaifAppPublic)
export const bitflyer = functions.https.onRequest(BitFlyerApp);

export const fsZaif = functions.pubsub.topic('minutely30-tick').onPublish(zaifMarket)
export const fsCoinMarket = functions.pubsub.topic('minutely30-tick').onPublish(coinmarket);

export const collectKick = functions.pubsub.topic('daily-tick').onPublish(kick);
export const collectUserData = functions.pubsub.topic('collect').onPublish(user_data);
export const collect = functions.https.onRequest(CollectApp);
