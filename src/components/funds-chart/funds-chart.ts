import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { AmChart, AmChartsService } from '@amcharts/amcharts3-angular'
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
export class FundsChartComponent implements OnInit {

  loadingFunds: Subject<boolean> = new BehaviorSubject(false);

  @Input()
  funds$: Observable<any>;

  @Input()
  providerName: string;

  @Output()
  refreshFunds = new EventEmitter<boolean>();

  chart: AmChart;

  constructor(
    private AmCharts: AmChartsService,
  ) {
    console.log('Hello FundsChartComponent Component');
    this.loadingFunds.subscribe(console.log);
  }

  ngOnInit(): void {
    this.chart = this.AmCharts.makeChart(`${this.providerName}-chart`, {
      type: 'pie',
      theme: 'light',
      dataProvider: [],
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
    
    this.funds$
    .subscribe(data => {
      this.AmCharts.updateChart(this.chart, () => {
        this.chart.dataProvider = data;
      })
      this.loadingFunds.next(false);
    });
  }

  refresh() {
    console.log('refreshing');
    this.loadingFunds.next(true);
    this.refreshFunds.emit(true)
  }

}
