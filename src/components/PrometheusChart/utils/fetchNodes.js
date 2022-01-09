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

import { fetchPrometheus } from 'components/PrometheusChart/utils/utils';
import { get } from 'lodash';
import isEqual from 'react-fast-compare';

export const defaultGetNodes = async () => {
  const ret = await fetchPrometheus(
    get(METRICDICT, 'physicalNode.systemLoad.url[0]'),
    'current'
  );
  const {
    data: { result: results = [] },
  } = ret;
  if (results.length === 0) {
    return [
      {
        metric: {
          instance: '',
        },
      },
    ];
  }
  return results.map((result) => ({
    metric: {
      instance: result.metric.instance,
    },
  }));
};

export const getMemcacheNodes = async () => {
  const ret = await fetchPrometheus(
    get(METRICDICT, 'memcacheService.currentConnections.url[0]'),
    'current'
  );
  const {
    data: { result: results = [] },
  } = ret;
  if (results.length === 0) {
    return [
      {
        metric: {
          instance: '',
        },
      },
    ];
  }
  return results.map((result) => ({
    metric: {
      instance: result.metric.instance,
    },
  }));
};

export const getRabbitMQNodes = async () => {
  const response = await fetchPrometheus(
    get(METRICDICT, 'rabbitMQService.serviceStatus.url[0]'),
    'current'
  );

  const {
    data: { result: results = [] },
  } = response;
  if (results.length === 0) {
    return [
      {
        metric: {
          instance: '',
        },
      },
    ];
  }
  const ret = [];
  results.forEach((result) => {
    const item = {
      metric: {
        instance: result.metric.instance,
      },
    };
    if (!ret.find((i) => isEqual(i, item))) {
      ret.push(item);
    }
  });
  return ret;
};

export const getMysqlNodes = async () => {
  const ret = await fetchPrometheus(
    get(METRICDICT, 'mysqlService.runningTime.url[0]'),
    'current'
  );
  const {
    data: { result: results = [] },
  } = ret;
  if (results.length === 0) {
    return [
      {
        metric: {
          instance: '',
        },
      },
    ];
  }
  return results.map((result) => ({
    metric: {
      instance: result.metric.instance,
    },
  }));
};
