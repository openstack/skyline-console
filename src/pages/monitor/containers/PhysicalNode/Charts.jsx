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
import { observer } from 'mobx-react';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import ChartCard from 'components/PrometheusChart/ChartCard';
import { ChartType } from 'components/PrometheusChart/utils/utils';
import { Col, Progress, Row } from 'antd';
import { merge, get } from 'lodash';
import BaseCard from 'components/PrometheusChart/BaseCard';
import { getSuitableValue } from 'resources/monitoring';
import moment from 'moment';
import { computePercentage, formatSize, formatUsedTime } from 'utils/index';
import styles from './index.less';

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
      renderContent: (store) => (
        <div className={styles.topContent}>{store.data}</div>
      ),
    };
    const chartLists = [
      {
        title: t('CPU Cores'),
        span: 5,
        constructorParams: {
          metricKey: 'physicalNode.cpuCores',
        },
        renderContent: (store) => (
          <div className={styles.topContent}>
            {get(store.data, 'length', 0)}
          </div>
        ),
      },
      {
        title: t('Total Ram'),
        span: 5,
        constructorParams: {
          metricKey: 'physicalNode.totalMem',
        },
        renderContent: (store) => (
          <div className={styles.topContent}>
            {getSuitableValue(get(store.data[0], 'y', 0), 'memory')}
          </div>
        ),
      },
      {
        title: t('System Running Time'),
        span: 5,
        constructorParams: {
          metricKey: 'physicalNode.systemRunningTime',
        },
        renderContent: (store) => (
          <div className={styles.topContent}>
            {formatUsedTime(
              (moment().unix() -
                parseInt(get(store.data[0], 'y', moment().unix()), 10)) *
                1000
            )}
          </div>
        ),
      },
      {
        title: t('File System Free Space'),
        span: 9,
        constructorParams: {
          metricKey: 'physicalNode.fileSystemFreeSpace',
          formatDataFn: (...rest) => {
            const [data, typeKey, deviceKey] = rest;
            const [avail, size] = data;
            const { data: { result } = { result: [] } } = avail;
            const temp = [];
            result.forEach((item, index) => {
              temp.push({
                mountpoint:
                  get(item, `metric.${deviceKey}`) +
                  get(item, `metric.${typeKey}`),
                avail: parseFloat(get(item, 'value[1]', 0)),
                total: parseFloat(
                  get(size, `data.result[${index}].value[1]`, 0)
                ),
              });
            });
            return temp;
          },
          typeKey: 'mountpoint',
          deviceKey: 'device',
        },
        renderContent: (store) => (
          <div
            style={{
              height: 100,
              overflow: 'auto',
            }}
          >
            {(store.data || []).map((item, index) => {
              const percentage = computePercentage(item.avail, item.total);
              const percentageColor = percentage > 80 ? '#FAAD14' : '#1890FF';
              return (
                <div
                  key={item.mountpoint}
                  style={{ marginTop: index > 0 ? 16 : 0 }}
                >
                  <div>
                    <div style={{ float: 'left' }}>{item.mountpoint}</div>
                    <div style={{ float: 'right' }}>
                      {`${formatSize(parseInt(item.avail, 10))} / ${formatSize(
                        parseInt(item.total, 10)
                      )}`}
                    </div>
                  </div>
                  <Progress
                    style={{ width: '95%' }}
                    percent={(
                      (parseInt(item.avail, 10) / parseInt(item.total, 10)) *
                      100
                    ).toFixed(3)}
                    strokeColor={percentageColor}
                  />
                </div>
              );
            })}
          </div>
        ),
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
        height: 250,
        scale: {
          y: {
            nice: true,
          },
        },
      },
    };
    const chartLists = [
      {
        title: t('CPU Usage(%)'),
        constructorParams: {
          metricKey: 'physicalNode.cpuUsage',
          typeKey: 'mode',
        },
        chartProps: {
          chartType: ChartType.MULTILINE,
        },
      },
      {
        title: t('Memory Usage'),
        constructorParams: {
          metricKey: 'physicalNode.memUsage',
          modifyKeys: [t('Used'), t('Free')],
        },
        chartProps: {
          scale: {
            y: {
              formatter: (d) => getSuitableValue(d, 'memory', 0),
            },
          },
          chartType: ChartType.MULTILINE,
        },
      },
      {
        title: t('DISK IOPS'),
        constructorParams: {
          metricKey: 'physicalNode.diskIOPS',
          modifyKeys: [t('read'), t('write')],
          deviceKey: 'device',
        },
        chartProps: {
          chartType: ChartType.MULTILINEDEVICES,
        },
      },
      {
        title: t('DISK Usage(%)'),
        constructorParams: {
          metricKey: 'physicalNode.diskUsage',
          typeKey: 'hostname',
          deviceKey: 'device',
        },
        chartProps: {
          scale: {
            y: {
              alias: t('DISK Usage(%)'),
            },
          },
          chartType: ChartType.ONELINEDEVICES,
        },
      },
      {
        title: t('System Load'),
        span: 24,
        constructorParams: {
          metricKey: 'physicalNode.systemLoad',
          typeKey: '__name__',
        },
        chartProps: {
          chartType: ChartType.MULTILINE,
        },
      },
      {
        title: t('Network Traffic'),
        span: 12,
        constructorParams: {
          metricKey: 'physicalNode.networkTraffic',
          modifyKeys: [t('receive'), t('transmit')],
          deviceKey: 'device',
        },
        chartProps: {
          chartType: ChartType.MULTILINEDEVICES,
          scale: {
            y: {
              formatter: (d) => getSuitableValue(d, 'traffic', 0),
            },
          },
        },
      },
      {
        title: t('TCP Connections'),
        span: 12,
        constructorParams: {
          metricKey: 'physicalNode.tcpConnections',
        },
        chartProps: {
          scale: {
            y: {
              alias: t('TCP Connections'),
            },
          },
          chartType: ChartType.ONELINE,
        },
      },
      {
        title: t('Network Errors'),
        span: 12,
        constructorParams: {
          metricKey: 'physicalNode.networkErrors',
          typeKey: '__name__',
          deviceKey: 'device',
        },
        chartProps: {
          scale: {
            y: {
              alias: t('Network Errors'),
            },
          },
          chartType: ChartType.ONELINE,
        },
      },
      {
        title: t('Network Dropped Packets'),
        span: 12,
        constructorParams: {
          metricKey: 'physicalNode.networkDroppedPackets',
          modifyKeys: [t('receive'), t('transmit')],
          deviceKey: 'device',
        },
        chartProps: {
          scale: {
            y: {
              alias: t('Network Dropped Packets'),
            },
          },
          chartType: ChartType.MULTILINEDEVICES,
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
        <Col>{this.renderChartCards()}</Col>
      </Row>
    );
  }
}

export default Charts;
