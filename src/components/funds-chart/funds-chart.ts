import { Component, Input, Output, EventEmitter, OnInit, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular'
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AfterViewInit, OnDestroy, OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import * as moment from 'moment';

/**
 * Generated class for the FhndsChartComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'funds-chart',
  templateUrl: 'funds-chart.html'
})
export class FundsChartComponent implements AfterViewInit, OnDestroy, OnChanges {

  loadingFunds: Subject<boolean> = new BehaviorSubject(true);

  @Input()
  funds: any; //Observable<any>;

  @Input()
  providerName: string;

  @Input()
  lastUpdateAt: number = 0;

  @Output()
  refreshFunds = new EventEmitter<boolean>();

  chart: AmChart;

  private f$ = new ReplaySubject(1);

  constructor(
    private AmCharts: AmChartsService,
  ) {
    console.log('Hello FundsChartComponent Component');
  }

  ngAfterViewInit(): void {
    this.chart = this.AmCharts.makeChart(`${this.providerName}-chart`, {
      type: 'pie',
      theme: 'light',
      dataProvider: this.funds,
      valueField: 'price',
      titleField: 'currency',
      groupPercent: 5,
      labelText: '[[percents]]%',
      autoMargins: false,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      labelRadius: -35,
    })
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log(this.funds);
    if(this.chart) {
      this.AmCharts.updateChart(this.chart, () => {
        this.chart.dataProvider = this.funds;
      })
    }
    this.loadingFunds.next(false);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.AmCharts.destroyChart(this.chart);
    }
  }

  refresh() {
    console.log('refreshing');
    this.loadingFunds.next(true);
    this.refreshFunds.emit(true)
  }

}
