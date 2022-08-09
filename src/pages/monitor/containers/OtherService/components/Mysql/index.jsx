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
import { get } from 'lodash';

import BaseContent from 'components/PrometheusChart/component/BaseContent';
import { getMysqlNodes } from 'components/PrometheusChart/utils/fetchNodes';
import { formatUsedTime } from 'src/utils';
import styles from 'components/PrometheusChart/component/styles.less';
import { ChartType } from 'components/PrometheusChart/utils/utils';

const topCardList = [
  {
    title: t('Running Time'),
    span: 6,
    createFetchParams: {
      metricKey: 'mysqlService.runningTime',
    },
    renderContent: ({ data }) => (
      <div className={styles['top-content']}>
        {/* convert to milliseconds */}
        {formatUsedTime(get(data, '[0].y', 0) * 1000)}
      </div>
    ),
  },
  {
    title: t('Connected Threads'),
    span: 6,
    createFetchParams: {
      metricKey: 'mysqlService.connectedThreads',
    },
  },
  {
    title: t('Running Threads'),
    span: 6,
    createFetchParams: {
      metricKey: 'mysqlService.runningThreads',
    },
  },
  {
    title: t('Slow Query'),
    span: 6,
    createFetchParams: {
      metricKey: 'mysqlService.slowQuery',
    },
  },
];

const chartCardList = [
  {
    title: t('Threads Activity Trends'),
    createFetchParams: {
      metricKey: 'mysqlService.threadsActivityTrends_connected',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Threads Activity Trends'),
        },
      },
    },
  },
  {
    title: t('MySQL Actions'),
    createFetchParams: {
      metricKey: 'mysqlService.mysqlActions',
    },
    handleDataParams: {
      modifyKeys: [t('delete'), t('insert'), t('update')],
    },
    chartProps: {
      chartType: ChartType.MULTILINE,
      scale: {
        y: {
          alias: t('MySQL Actions'),
        },
      },
    },
  },
  {
    title: t('Slow Query'),
    createFetchParams: {
      metricKey: 'mysqlService.slowQueryChart',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Slow Query'),
        },
      },
    },
  },
];

export const chartConfig = {
  topCardList,
  chartCardList,
};

export default ({ type }) => (
  <BaseContent
    type={type}
    chartConfig={chartConfig}
    fetchNodesFunc={getMysqlNodes}
  />
);
