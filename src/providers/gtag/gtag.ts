import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
declare let gtag: any;
/*
  Generated class for the GtagProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GtagProvider {

  public readonly id = 'UA-80739523-4';

  constructor(
    private afAuth: AngularFireAuth,
  ) {
    console.log('Hello GtagProvider Provider');
    this.afAuth.authState.map(u => u ? u.uid : '')
    .subscribe(uid => {
      gtag('config', this.id, {'user_id': uid});
    })
  }

  public pageView(page_path: string) {
    if (!page_path.startsWith('/')) {
      page_path = '/' + page_path;
    }
    gtag('config', this.id, {'page_path': page_path})
  }

}
