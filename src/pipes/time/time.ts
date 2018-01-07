import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
/**
 * Generated class for the TimePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
moment.locale('ja')
@Pipe({
  name: 'time',
})
export class TimePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: number, ...args) {
    return moment.unix(value).locale('ja').format('LLL');
  }
}
