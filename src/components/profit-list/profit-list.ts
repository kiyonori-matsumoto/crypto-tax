import { Component, OnInit, Input, Output, EventEmitter }
  from '@angular/core';
import { AggregateInterface } from '../../providers/trade-aggregate/trade-aggregate';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

/**
 * Generated class for the ProfitListComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'profit-list',
  templateUrl: 'profit-list.html'
})
export class ProfitListComponent implements OnInit {

  @Input()
  agg$: Observable<AggregateInterface[]>

  @Input()
  providerName: string;

  @Output()
  refreshAgg = new EventEmitter<boolean>();

  loading: Subject<boolean> = new BehaviorSubject(false);

  aggregate: any;

  constructor() {
    console.log('Hello ProfitListComponent Component');
  }

  ngOnInit() {
    this.agg$
    .subscribe(data => {
      this.aggregate = data;
      this.loading.next(false);
    })
  }

  refresh() {
    this.loading.next(true);
    this.refreshAgg.emit(true);
  }

}
