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
import { Col, Progress, Row } from 'antd';

import BaseContent from 'components/PrometheusChart/component/BaseContent';
import {
  cephStatusColorMap,
  cephStatusMap,
  getSuitableValue,
} from 'resources/prometheus/monitoring';
import CircleChart from 'components/PrometheusChart/CircleWithRightLegend';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import { computePercentage } from 'src/utils';
import { ChartType } from 'components/PrometheusChart/utils/utils';
import RenderTabs from './RenderTabs';

import styles from './index.less';

const StorageCluster = () => {
  const topCardList = [
    {
      title: t('Storage Cluster Status'),
      span: 6,
      createFetchParams: {
        metricKey: 'storageCluster.cephHealthStatus',
      },
      renderContent: ({ data }) => {
        const d = get(data, 'y', 0);
        return (
          <div
            className={styles['top-content']}
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: cephStatusColorMap[d],
            }}
          >
            {cephStatusMap[d]}
          </div>
        );
      },
    },
    {
      title: 'Monitors',
      span: 9,
      createFetchParams: {
        metricKey: 'storageCluster.cephMonitorStatus',
      },
      handleDataParams: {
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
            const newVal = status[i.y].value + 1;
            status[i.y].value = newVal;
          });
          return status;
        },
      },
      renderContent: ({ data }) => (
        <div>
          <div style={{ height: 120 }}>
            <CircleChart data={data} />
          </div>
        </div>
      ),
    },
    {
      title: 'PGs',
      span: 9,
      createFetchParams: {
        metricKey: 'storageCluster.cephPGS',
      },
      handleDataParams: {
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
      renderContent: ({ data }) => (
        <div>
          <div style={{ height: 120 }}>
            <CircleChart data={data} />
          </div>
        </div>
      ),
    },
    {
      title: 'OSDs',
      span: 9,
      createFetchParams: {
        metricKey: 'storageCluster.osdData',
      },
      handleDataParams: {
        formatDataFn: (resps) => {
          function getValue(d) {
            return get(d, 'data.result[0].value[1]', 0);
          }
          const [inUp, inDown, outUp, outDown] = resps;
          return {
            inUp: getValue(inUp),
            inDown: getValue(inDown),
            outUp: getValue(outUp),
            outDown: getValue(outDown),
          };
        },
      },
      renderContent: ({ data }) => {
        return (
          <Row className={styles.osd}>
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
      createFetchParams: {
        metricKey: 'storageCluster.avgPerOSD',
      },
    },
    {
      title: t('Storage Cluster Usage'),
      span: 10,
      createFetchParams: {
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
          <div className={styles['top-content']}>
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
                    progressPercentage > 80
                      ? globalCSS.warnDarkColor
                      : globalCSS.primaryColor
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

  const chartCardList = [
    {
      title: t('Storage Pool Capacity Usage'),
      createFetchParams: {
        metricKey: 'storageCluster.poolCapacityUsage',
      },
      handleDataParams: {
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
      createFetchParams: {
        metricKey: 'storageCluster.clusterOSDLatency',
      },
      handleDataParams: {
        modifyKeys: ['apply', 'commit'],
      },
      chartProps: {
        chartType: ChartType.MULTILINE,
      },
    },
    {
      title: t('Storage Cluster IOPS'),
      createFetchParams: {
        metricKey: 'storageCluster.clusterIOPS',
      },
      handleDataParams: {
        modifyKeys: [t('read'), t('write')],
      },
      chartProps: {
        chartType: ChartType.MULTILINE,
      },
    },
    {
      title: t('Storage Cluster Bandwidth'),
      createFetchParams: {
        metricKey: 'storageCluster.clusterBandwidth',
      },
      handleDataParams: {
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
  const chartConfig = {
    chartCardList,
    topCardList,
  };
  return (
    <BaseContent renderNodeSelect={false} chartConfig={chartConfig}>
      <RenderTabs />
    </BaseContent>
  );
};

export default StorageCluster;
