// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { action, computed, observable, set } from 'mobx';
import {
  addParams,
  defaultOneHourAgo,
  getInterval,
} from 'components/PrometheusChart/utils/utils';
import { getTimestamp } from 'utils/time';
import Base from '../base';

export default class MonitorBase extends Base {
  get responseKey() {
    return '';
  }

  @observable
  currentRange = defaultOneHourAgo();

  @observable
  interval = 10;

  @observable
  loading = true;

  @action
  handleRangePickerChange = async (dates, refresh = false) => {
    if (
      !refresh &&
      !(
        getTimestamp(this.currentRange[0]) === getTimestamp(dates[0]) &&
        getTimestamp(this.currentRange[1]) === getTimestamp(dates[1])
      )
    ) {
      // do not extract, see @compute get intervals functions
      this.currentRange = dates;
      this.interval = this.intervals[0].value;
    } else {
      // do not extract, see @compute get intervals functions
      this.currentRange = dates;
    }
    await this.getChartData();
  };

  @computed get intervals() {
    return getInterval(this.currentRange);
  }

  // getRange = type => ({
  //   // last 2 weeks
  //   3: [moment().subtract(2, 'weeks'), moment()],
  //   // last 7 days
  //   2: [moment().subtract(1, 'weeks'), moment()],
  //   // last day
  //   1: [moment().subtract(1, 'days'), moment()],
  //   // last hour
  //   0: [moment().subtract(1, 'hours'), moment()],
  // }[type] || [moment().subtract(1, 'hours'), moment()]);

  @action
  handleIntervalChange = async (interval) => {
    this.interval = interval;
    await this.getChartData();
  };

  @action
  handleDeviceChange = (device, type) => {
    const source = this[type];
    set(source, {
      isLoading: true,
    });
    const data = source.data.filter((item) => item.device === device);
    setTimeout(() => {
      set(source, {
        currentDevice: device,
        currentShowData: data,
        isLoading: false,
      });
    }, 200);
  };

  formatToGiB(str) {
    return parseFloat((parseInt(str, 10) / 1073741824).toFixed(2));
  }

  buildRequest(query, getRangeType = 'range', params = {}) {
    const newQueryStr =
      Object.keys(params).length === 0 ? query : addParams(query, params);
    if (getRangeType === 'current') {
      return this.skylineClient.query.list({
        query: newQueryStr,
      });
    }
    return this.skylineClient.queryRange.list({
      query: newQueryStr,
      start: getTimestamp(this.currentRange[0]),
      end: getTimestamp(this.currentRange[1]),
      step: this.interval,
    });
  }
}
