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

import { observable, action } from 'mobx';
import { get, isArray } from 'lodash';
import DataSet from '@antv/data-set';
import {
  getRequestUrl,
  fetchPrometheus,
} from 'components/PrometheusChart/utils/utils';
import metricDict from '../metricDict';

export default class FetchPrometheusStore {
  type = '';

  @observable
  data = [];

  @observable
  isLoading = true;

  @observable
  device;

  @observable
  devices = [];

  constructor({
    requestType,
    metricKey,
    formatDataFn,
    typeKey,
    deviceKey,
    modifyKeys,
  }) {
    // 保存类型是range的还是current的
    this.requestType = requestType;
    // 获取初始串
    this.queryParams = get(metricDict, metricKey);
    // 格式化返回数据的方法
    this.formatDataFn = formatDataFn || this.baseReturnFunc;
    // 设置type的key
    this.typeKey = typeKey;
    // 设置device的key
    this.deviceKey = deviceKey;
    // 自定义type的值，用于tooltip的展示，否则一直会是y（方便处理）
    this.modifyKeys = modifyKeys;
  }

  baseReturnFunc = (d) => d;

  @action
  async fetchData({ params = {}, currentRange, interval }) {
    this.isLoading = true;
    this.device = undefined;
    const promises = this.queryParams.url.map((u, idx) => {
      // 按顺序取聚合函数
      const finalFormatFunc =
        (this.queryParams.finalFormatFunc || [])[idx] || this.baseReturnFunc;
      // 按顺序获取基础参数
      const baseParams = (this.queryParams.baseParams || [])[idx] || {};
      const finalUrl = getRequestUrl(u, params, finalFormatFunc, baseParams);
      return fetchPrometheus(
        finalUrl,
        this.requestType,
        currentRange,
        interval
      );
    });
    const res = await Promise.all(promises).catch((e) => {
      // eslint-disable-next-line no-console
      console.log(e);
      return this.data;
    });
    this.formatData(res);
    this.isLoading = false;
    return this.data;
  }

  formatData(data) {
    const formatedData = this.formatDataFn(
      data,
      this.typeKey,
      this.deviceKey,
      this.modifyKeys
    );
    this.data = [...formatedData];
    if (
      isArray(formatedData) &&
      formatedData.length !== 0 &&
      formatedData[0].device
    ) {
      const dv = new DataSet()
        .createView()
        .source(formatedData)
        .transform({
          type: 'partition',
          groupBy: ['device'],
        });
      this.devices = Object.keys(dv.rows).map((device) =>
        device.slice(1, device.length)
      );
      this.device = this.devices[0];
    }
  }

  @action
  handleDeviceChange = (device) => {
    this.isLoading = true;
    this.device = device;
    setTimeout(() => {
      this.isLoading = false;
    }, 200);
  };

  @action
  updateData = (data) => {
    this.data = data;
  };
}
