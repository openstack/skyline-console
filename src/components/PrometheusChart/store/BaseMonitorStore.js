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

import { action, computed, observable } from 'mobx';
import {
  defaultOneHourAgo,
  fetchPrometheus,
  getInterval,
} from 'components/PrometheusChart/utils/utils';

import { get } from 'lodash';
import { getTimestamp } from 'utils/time';

export default class BaseMonitorStore {
  constructor(props) {
    const { fetchNodesFunc } = props || {};
    if (fetchNodesFunc) {
      this.fetchNodesFunc = fetchNodesFunc;
    }
  }

  @observable
  nodes = [];

  @observable
  node = {
    metric: {
      hostname: '',
    },
  };

  @observable
  currentRange = defaultOneHourAgo;

  @observable
  interval = 10;

  @observable
  isLoading = true;

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
    // await this.getChartData();
  };

  @computed get intervals() {
    return getInterval(this.currentRange);
  }

  @action
  handleIntervalChange = async (interval) => {
    this.interval = interval;
    // await this.getChartData();
  };

  @action
  getNodes = async () => {
    this.isLoading = true;
    let result = [];
    try {
      if (this.fetchNodesFunc) {
        result = await this.fetchNodesFunc();
      } else {
        const query = 'node_load1';
        const res = await fetchPrometheus(query, 'current', this.currentRange);
        result = get(res, 'data.result', []);
      }
    } finally {
      this.nodes = result;
      this.node = this.nodes[0] || {
        metric: {
          hostname: '',
        },
      };
      this.isLoading = false;
    }
  };

  @action
  handleNodeChange = async (instance) => {
    const newNode = this.nodes.find(
      (item) => item.metric.instance === instance
    );
    this.node = newNode;
  };

  @action
  setLoading(flag) {
    this.isLoading = flag;
  }
}
