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
import { observer } from 'mobx-react';
import { getSuitableValue } from 'resources/monitoring';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import { merge } from 'lodash';
import { ChartType } from 'components/PrometheusChart/utils/utils';
import ChartCard from 'components/PrometheusChart/ChartCard';

@observer
class Charts extends Component {
  constructor(props) {
    super(props);
    this.store = props.store;
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
        title: t('Current Connections'),
        constructorParams: {
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
        constructorParams: {
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
        title: t('Read And Write'),
        constructorParams: {
          metricKey: 'memcacheService.readWriteBytesTotal',
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
        constructorParams: {
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
        constructorParams: {
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
    return <>{this.renderChartCards()}</>;
  }
}

export default Charts;
