import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import {app as ZaifApp, app2 as ZaifAppPublic} from './zaif/'

admin.initializeApp(functions.config().firebase);
// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
export const zaif = functions.https.onRequest(ZaifApp)
export const zaif_public = functions.https.onRequest(ZaifAppPublic)
