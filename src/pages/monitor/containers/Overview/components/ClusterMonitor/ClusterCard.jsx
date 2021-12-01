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
import { Col, Progress, Row } from 'antd';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import { get, merge } from 'lodash';
import { getSuitableValue } from 'resources/monitoring';
import { computePercentage } from 'utils/index';
import BaseCard from 'components/PrometheusChart/BaseCard';
import styles from '../../index.less';

const ClusterCard = (props) => {
  const { store: propStore } = props;
  const baseConfig = {
    span: 12,
    constructorParams: {
      requestType: 'current',
      formatDataFn: handleResponses,
    },
    visibleHeight: 55,
    renderContent: (store) => (
      <div className={styles.topContent}>{store.data}</div>
    ),
  };
  const chartLists = [
    {
      title: t('Physical CPU Usage'),
      span: 12,
      constructorParams: {
        metricKey: 'monitorOverview.physicalCPUUsage',
      },
      renderContent: (store) => {
        const { data } = store;
        const used = get(data[0], 'y', 0);
        const total = get(data[1], 'y', 0);
        return (
          <div className={styles.topContent} style={{ height: 55 }}>
            <div>
              <Row style={{ alignItems: 'baseline', justifyContent: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 600 }}>
                  {computePercentage(used, total)}
                </span>
                %
              </Row>
              <Row
                style={{
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  fontSize: 12,
                }}
              >
                {`${used} / ${total}`}
              </Row>
            </div>
          </div>
        );
      },
    },
    {
      title: t('Total Ram'),
      span: 12,
      constructorParams: {
        metricKey: 'monitorOverview.physicalMemoryUsage',
      },
      renderContent: (store) => {
        const { data } = store;
        const usedValue = get(data[0], 'y', 0);
        const totalValue = get(data[1], 'y', 0);
        const used = getSuitableValue(usedValue, 'memory');
        const total = getSuitableValue(totalValue, 'memory');
        return (
          <div className={styles.topContent} style={{ height: 55 }}>
            <div>
              <Row style={{ alignItems: 'baseline', justifyContent: 'center' }}>
                <span style={{ fontSize: 28, fontWeight: 600 }}>
                  {computePercentage(usedValue, totalValue)}
                </span>
                %
              </Row>
              <Row
                style={{
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  fontSize: 12,
                }}
              >
                {`${used} / ${total}`}
              </Row>
            </div>
          </div>
        );
      },
    },
    {
      title: t('Physical Storage Usage'),
      span: 24,
      constructorParams: {
        metricKey: 'monitorOverview.physicalStorageUsage',
      },
      renderContent: (store) => {
        const { data } = store;
        const usedValue = get(data[0], 'y', 0);
        const totalValue = get(data[1], 'y', 0);

        const used = getSuitableValue(usedValue, 'disk');
        const total = getSuitableValue(totalValue, 'disk');
        const progressPercentage = computePercentage(usedValue, totalValue);
        return (
          <div className={styles.topContent} style={{ height: 55 }}>
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
                  strokeColor={progressPercentage > 80 ? '#FAAD14' : '#1890FF'}
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
              currentRange={propStore.currentRange}
              interval={propStore.interval}
            />
          </Col>
        );
      })}
    </Row>
  );
};

export default ClusterCard;
