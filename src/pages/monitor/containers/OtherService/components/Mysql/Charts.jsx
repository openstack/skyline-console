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
import { formatUsedTime } from 'utils/index';
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
      span: 12,
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
        title: t('Running Time'),
        span: 6,
        constructorParams: {
          metricKey: 'mysqlService.runningTime',
        },
        renderContent: (store) => (
          <div className={styles.topContent} style={{ height: 55 }}>
            {/* 转化为毫秒 */}
            {formatUsedTime(get(store.data[0], 'y', 0) * 1000)}
          </div>
        ),
      },
      {
        title: t('Connected Threads'),
        span: 6,
        constructorParams: {
          metricKey: 'mysqlService.connectedThreads',
        },
      },
      {
        title: t('Running Threads'),
        span: 6,
        constructorParams: {
          metricKey: 'mysqlService.runningThreads',
        },
      },
      {
        title: t('Slow Query'),
        span: 6,
        constructorParams: {
          metricKey: 'mysqlService.slowQuery',
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
        title: t('Threads Activity Trends'),
        constructorParams: {
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
        constructorParams: {
          metricKey: 'mysqlService.mysqlActions',
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
        constructorParams: {
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
