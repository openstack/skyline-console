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

import React, { Component } from 'react';
import { Col, Row } from 'antd';
import styles from 'pages/monitor/containers/StorageCluster/index.less';
import { observer } from 'mobx-react';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import { get, merge } from 'lodash';
import BaseCard from 'components/PrometheusChart/BaseCard';
import { ChartType } from 'components/PrometheusChart/utils/utils';
import ChartCard from 'components/PrometheusChart/ChartCard';

@observer
class Charts extends Component {
  constructor(props) {
    super(props);
    this.store = props.store;
  }

  renderTopCards() {
    const baseConfig = {
      constructorParams: {
        requestType: 'current',
        formatDataFn: handleResponses,
      },
      visibleHeight: 55,
      renderContent: (store) => (
        <div className={styles.topContent} style={{ height: 55 }}>
          {get(store, 'data[0].y', 0)}
        </div>
      ),
    };
    const chartLists = [
      {
        title: t('Server Status'),
        span: 6,
        constructorParams: {
          metricKey: 'rabbitMQService.serviceStatus',
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
        renderContent: (store) => {
          const { data } = store;
          return (
            <div className={styles.topContent} style={{ height: 55 }}>
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
        constructorParams: {
          metricKey: 'rabbitMQService.totalConnections',
        },
      },
      {
        title: t('Total Queues'),
        constructorParams: {
          metricKey: 'rabbitMQService.totalQueues',
        },
      },
      {
        title: t('Total Exchanges'),
        constructorParams: {
          metricKey: 'rabbitMQService.totalExchanges',
        },
      },
      {
        title: t('Total Consumers'),
        constructorParams: {
          metricKey: 'rabbitMQService.totalConsumers',
        },
      },
    ];
    return (
      <Row gutter={[16, 16]}>
        {chartLists.map((chartProps) => {
          const config = merge({}, baseConfig, chartProps);
          const { span, ...rest } = config;
          return (
            <Col flex={1} key={chartProps.constructorParams.metricKey}>
              <BaseCard
                {...rest}
                currentRange={this.store.currentRange}
                interval={this.store.interval}
                params={{
                  instance: this.store.node.metric.instance,
                }}
              />
            </Col>
          );
        })}
      </Row>
    );
  }

  renderChartCards() {
    const baseConfig = {
      span: 12,
      constructorParams: {
        requestType: 'range',
        formatDataFn: handleResponses,
      },
      chartProps: {
        height: 300,
        scale: {
          y: {
            nice: true,
          },
        },
      },
    };
    const chartLists = [
      {
        title: t('Published Out'),
        constructorParams: {
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
        constructorParams: {
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
      // {
      //   title: t('Total Message'),
      //   constructorParams: {
      //     metricKey: 'rabbitMQService.totalMessage',
      //   },
      //   chartProps: {
      //     chartType: ChartType.ONELINE,
      //     scale: {
      //       y: {
      //         alias: t('Total Message'),
      //       },
      //     },
      //   },
      // },
      {
        title: t('Channel'),
        constructorParams: {
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
    return (
      <Row gutter={[16, 16]}>
        {chartLists.map((chartProps) => {
          const config = merge({}, baseConfig, chartProps);
          const { span, ...rest } = config;
          return (
            <Col span={span} key={chartProps.constructorParams.metricKey}>
              <ChartCard
                {...rest}
                currentRange={this.store.currentRange}
                interval={this.store.interval}
                params={{
                  instance: this.store.node.metric.instance,
                }}
                BaseContentConfig={this.props.BaseContentConfig}
              />
            </Col>
          );
        })}
      </Row>
    );
  }

  render() {
    if (this.store.isLoading) {
      return null;
    }
    return (
      <Row gutter={[16, 16]}>
        <Col span={24}>{this.renderTopCards()}</Col>
        <Col span={24}>{this.renderChartCards()}</Col>
      </Row>
    );
  }
}

export default Charts;
