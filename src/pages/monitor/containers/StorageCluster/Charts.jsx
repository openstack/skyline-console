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
import {
  cephStatusColorMap,
  cephStatusMap,
  getSuitableValue,
} from 'resources/monitoring';
import { computePercentage } from 'utils/index';
import CircleChart from 'components/PrometheusChart/CircleWithRightLegend';
import RenderTabs from './RenderTabs';
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
      renderContent: (store) => {
        const data = get(store, 'data[0].y', 0);
        return <div className={styles.topContent}>{data}</div>;
      },
      visibleHeight: 120,
    };
    const chartLists = [
      {
        title: t('Storage Cluster Status'),
        span: 6,
        constructorParams: {
          metricKey: 'storageCluster.cephHealthStatus',
        },
        renderContent: (store) => {
          const data = get(store.data, 'y', 0);
          return (
            <div
              className={styles.topContent}
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: cephStatusColorMap[data],
              }}
            >
              {cephStatusMap[data]}
            </div>
          );
        },
      },
      {
        title: 'Monitors',
        span: 9,
        constructorParams: {
          metricKey: 'storageCluster.cephMonitorStatus',
          formatDataFn: (...rest) => {
            const data = handleResponses(...rest);
            const status = [
              {
                type: 'down',
                value: 0,
              },
              {
                type: 'up',
                value: 0,
              },
            ];
            data.forEach((i) => {
              status[i.y].value++;
            });
            return status;
          },
        },
        renderContent: (store) => (
          <div>
            <div style={{ height: 120 }}>
              <CircleChart data={store.data} />
            </div>
          </div>
        ),
      },
      {
        title: 'PGs',
        span: 9,
        constructorParams: {
          metricKey: 'storageCluster.cephPGS',
          formatDataFn: (...rest) => {
            const data = handleResponses(...rest);
            return [
              {
                type: 'clean',
                value: get(data, '[0].y', 0),
              },
              {
                type: 'others',
                value: get(data, '[1].y', 0),
              },
            ];
          },
        },
        renderContent: (store) => (
          <div>
            <div style={{ height: 120 }}>
              <CircleChart data={store.data} />
            </div>
          </div>
        ),
      },
      {
        title: 'OSDs',
        span: 9,
        constructorParams: {
          metricKey: 'storageCluster.osdData',
          formatDataFn: (resps) => {
            const [inUp, inDown, outUp, outDown] = resps;
            return {
              inUp: getValue(inUp),
              inDown: getValue(inDown),
              outUp: getValue(outUp),
              outDown: getValue(outDown),
            };

            function getValue(d) {
              return get(d, 'data.result[0].value[1]', 0);
            }
          },
        },
        renderContent: (store) => {
          const { data } = store;
          return (
            <Row className={styles.OSDs}>
              <Col span={8} />
              <Col span={8} style={{ fontSize: 14, opacity: 0.8 }}>
                {t('Up')}
              </Col>
              <Col span={8} style={{ fontSize: 14, opacity: 0.8 }}>
                {t('Down')}
              </Col>
              <Col span={8} style={{ fontSize: 14, opacity: 0.8 }}>
                {t('In Cluster')}
              </Col>
              <Col span={8} style={{ fontSize: 18 }}>
                {data.inUp}
              </Col>
              <Col span={8} style={{ fontSize: 18 }}>
                {data.inDown}
              </Col>
              <Col span={8} style={{ fontSize: 14, opacity: 0.8 }}>
                {t('Out Cluster')}
              </Col>
              <Col span={8} style={{ fontSize: 18 }}>
                {data.outUp}
              </Col>
              <Col span={8} style={{ fontSize: 18 }}>
                {data.outDown}
              </Col>
            </Row>
          );
        },
      },
      {
        title: t('Average PGs per OSD'),
        span: 5,
        constructorParams: {
          metricKey: 'storageCluster.avgPerOSD',
        },
      },
      // {
      //   title: t('Average OSD Apply Latency(ms)'),
      //   span: 5,
      //   constructorParams: {
      //     metricKey: 'storageCluster.avgOSDApplyLatency',
      //   },
      // },
      // {
      //   title: t('Average OSD Commit Latency(ms)'),
      //   span: 5,
      //   constructorParams: {
      //     metricKey: 'storageCluster.avgOSDCommitLatency',
      //   },
      // },
      {
        title: t('Storage Cluster Usage'),
        span: 10,
        constructorParams: {
          metricKey: 'storageCluster.storageClusterUsage',
        },
        renderContent: (store) => {
          const { data } = store;
          const usedValue = get(data[0], 'y', 0);
          const totalValue = get(data[1], 'y', 0);
          const used = getSuitableValue(usedValue, 'disk');
          const total = getSuitableValue(totalValue, 'disk');
          const progressPercentage = computePercentage(usedValue, totalValue);
          return (
            <div className={styles.topContent}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                }}
              >
                <Row style={{ justifyContent: 'flex-end', height: '50%' }}>
                  <span
                    style={{
                      fontSize: 12,
                      marginRight: 32,
                    }}
                  >
                    {`${t('Used')} ${used} / ${t('Total')} ${total}`}
                  </span>
                </Row>
                <Row style={{ height: '50%' }}>
                  <Progress
                    style={{ width: '95%' }}
                    percent={progressPercentage}
                    strokeColor={
                      progressPercentage > 80 ? '#FAAD14' : '#1890FF'
                    }
                    showInfo={progressPercentage !== 100}
                  />
                </Row>
              </div>
            </div>
          );
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
        title: t('Storage Pool Capacity Usage'),
        constructorParams: {
          metricKey: 'storageCluster.poolCapacityUsage',
          modifyKeys: [t('used'), t('available')],
        },
        chartProps: {
          chartType: ChartType.MULTILINE,
          scale: {
            y: {
              formatter: (d) => getSuitableValue(d, 'disk', 0),
            },
          },
        },
      },
      {
        title: t('Storage Cluster OSD Latency'),
        constructorParams: {
          metricKey: 'storageCluster.clusterOSDLatency',
          modifyKeys: ['apply', 'commit'],
        },
        chartProps: {
          chartType: ChartType.MULTILINE,
        },
      },
      {
        title: t('Storage Cluster IOPS'),
        constructorParams: {
          metricKey: 'storageCluster.clusterIOPS',
          modifyKeys: [t('read'), t('write')],
        },
        chartProps: {
          chartType: ChartType.MULTILINE,
        },
      },
      {
        title: t('Storage Cluster Bandwidth'),
        constructorParams: {
          metricKey: 'storageCluster.clusterBandwidth',
          modifyKeys: [t('in'), t('out')],
        },
        chartProps: {
          scale: {
            y: {
              formatter: (d) => getSuitableValue(d, 'bandwidth', 0),
            },
          },
          chartType: ChartType.MULTILINE,
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
      <Row gutter={[16, 16]} style={{ paddingTop: 16 }}>
        <Col span={24}>{this.renderTopCards()}</Col>
        <Col span={24}>{this.renderChartCards()}</Col>
        <Col span={24}>
          <RenderTabs store={this.store} />
        </Col>
      </Row>
    );
  }
}

export default Charts;
