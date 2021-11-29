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
import { Col, Row } from 'antd';
import { computePercentage } from 'utils/index';
import {
  cephStatusColorMap,
  cephStatusMap,
  getSuitableValue,
} from 'resources/monitoring';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import { get, merge } from 'lodash';
import BaseCard from 'components/PrometheusChart/BaseCard';
import styles from '../../index.less';

const StorageClusterCard = (props) => {
  const { store: propStore } = props;
  const baseConfig = {
    span: 12,
    constructorParams: {
      requestType: 'current',
      formatDataFn: handleResponses,
    },
    visibleHeight: 65,
    renderContent: (store) => (
      <div className={styles.topContent}>{JSON.stringify(store.data)}</div>
    ),
  };
  const chartLists = [
    {
      title: t('Storage Cluster Status'),
      span: 24,
      constructorParams: {
        metricKey: 'monitorOverview.cephHealthStatus',
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
              height: 65,
            }}
          >
            {cephStatusMap[data]}
          </div>
        );
      },
    },
    {
      title: t('Storage Cluster Usage'),
      span: 12,
      constructorParams: {
        metricKey: 'monitorOverview.cephStorageUsage',
      },
      renderContent: (store) => {
        const { data } = store;
        const usedValue = get(data[0], 'y', 0);
        const totalValue = get(data[1], 'y', 0);
        const used = getSuitableValue(usedValue, 'disk');
        const total = getSuitableValue(totalValue, 'disk');
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
      title: t('Disk allocation (GB)'),
      span: 12,
      constructorParams: {
        metricKey: 'monitorOverview.cephStorageAllocate',
      },
      renderContent: (store) => {
        const { data } = store;
        const totalValue = parseFloat(get(data[1], 'y', 0).toFixed(2));
        const usedValue = parseFloat(
          (totalValue - get(data[0], 'y', 0)).toFixed(2)
        );
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
                {`${usedValue} GB / ${totalValue} GB`}
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

export default StorageClusterCard;
