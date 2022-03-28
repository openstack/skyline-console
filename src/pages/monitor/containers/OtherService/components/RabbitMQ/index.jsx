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
import { Col, Row } from 'antd';

import BaseContent from 'components/PrometheusChart/component/BaseContent';
import { getRabbitMQNodes } from 'components/PrometheusChart/utils/fetchNodes';
import { ChartType } from 'components/PrometheusChart/utils/utils';

import styles from 'components/PrometheusChart/component/styles.less';

const topCardList = [
  {
    title: t('Server Status'),
    createFetchParams: {
      metricKey: 'rabbitMQService.serviceStatus',
    },
    handleDataParams: {
      formatDataFn: (resps) => {
        const tmp = {
          up: 0,
          down: 0,
        };
        const result = get(resps[0], 'data.result', []);
        result.forEach((r) => {
          parseInt(r.value[1], 10) === 1 ? (tmp.up += 1) : (tmp.down += 1);
        });
        return tmp;
      },
    },
    renderContent: ({ data }) => {
      return (
        <div className={styles['top-content']}>
          <Row style={{ width: '100%', textAlign: 'center' }}>
            <Col span={12}>{data.up + t('Up')}</Col>
            <Col span={12}>{data.down + t('Down')}</Col>
          </Row>
        </div>
      );
    },
  },
  {
    title: t('Connected Threads'),
    createFetchParams: {
      metricKey: 'rabbitMQService.totalConnections',
    },
  },
  {
    title: t('Total Queues'),
    createFetchParams: {
      metricKey: 'rabbitMQService.totalQueues',
    },
  },
  {
    title: t('Total Exchanges'),
    createFetchParams: {
      metricKey: 'rabbitMQService.totalExchanges',
    },
  },
  {
    title: t('Total Consumers'),
    createFetchParams: {
      metricKey: 'rabbitMQService.totalConsumers',
    },
  },
];

const chartCardList = [
  {
    title: t('Published Out'),
    createFetchParams: {
      metricKey: 'rabbitMQService.publishedOut',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Published Out'),
        },
      },
    },
  },
  {
    title: t('Published In'),
    createFetchParams: {
      metricKey: 'rabbitMQService.publishedIn',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Published In'),
        },
      },
    },
  },
  {
    title: t('Channel'),
    createFetchParams: {
      metricKey: 'rabbitMQService.channel',
    },
    chartProps: {
      chartType: ChartType.ONELINE,
      scale: {
        y: {
          alias: t('Channel'),
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
    fetchNodesFunc={getRabbitMQNodes}
  />
);
