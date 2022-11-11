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

import React from 'react';
import BaseContent from 'components/PrometheusChart/component/BaseContent';
import { getMemcacheNodes } from 'components/PrometheusChart/utils/fetchNodes';
import { ChartType } from 'components/PrometheusChart/utils/utils';
import { getSuitableValue } from 'resources/prometheus/monitoring';

const chartCardList = [
  {
    title: t('Current Connections'),
    createFetchParams: {
      metricKey: 'memcacheService.currentConnections',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Current Connections'),
        },
      },
    },
  },
  {
    title: t('Total Connections'),
    createFetchParams: {
      metricKey: 'memcacheService.totalConnections',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Total Connections'),
        },
      },
    },
  },
  {
    title: t('Read and write'),
    createFetchParams: {
      metricKey: 'memcacheService.readWriteBytesTotal',
    },
    handleDataParams: {
      modifyKeys: [t('read'), t('write')],
    },
    chartProps: {
      chartType: ChartType.MULTILINE,
      scale: {
        y: {
          formatter: (d) => getSuitableValue(d, 'traffic', 0),
        },
      },
    },
  },
  {
    title: t('Evictions'),
    createFetchParams: {
      metricKey: 'memcacheService.evictions',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Evictions'),
        },
      },
    },
  },
  {
    title: t('Items in Cache'),
    createFetchParams: {
      metricKey: 'memcacheService.itemsInCache',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Items in Cache'),
        },
      },
    },
  },
];

export const chartConfig = {
  chartCardList,
};

export default ({ type }) => (
  <BaseContent
    type={type}
    chartConfig={chartConfig}
    fetchNodesFunc={getMemcacheNodes}
  />
);
