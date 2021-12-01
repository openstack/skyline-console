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
import { Col, Progress, Row, Tabs } from 'antd';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import { get, merge } from 'lodash';
import BaseCard from 'components/PrometheusChart/BaseCard';
import { Chart, Interval } from 'bizcharts';
import { getSuitableValue } from 'resources/monitoring';
import styles from '../../index.less';

const renderTopProgress = (store) => {
  const { data } = store;
  return (
    <Row style={{ height: '100%' }}>
      {data.map((d) => {
        const percentage = get(d, 'y', 0);
        const percentageColor = percentage > 80 ? '#FAAD14' : '#1890FF';
        return (
          <Col span={24} key={d.type}>
            <div>{d.type}</div>
            <Progress
              strokeColor={percentageColor}
              percent={percentage}
              style={{ marginBottom: 4 }}
              showInfo={percentage !== 100}
            />
          </Col>
        );
      })}
    </Row>
  );
};

const renderTopColumnExtra = (store) => {
  const { modifyKeys } = store;
  return (
    <Tabs
      className={styles.tabs}
      defaultActiveKey={modifyKeys[0]}
      onChange={(key) => store.handleDeviceChange(key)}
    >
      {modifyKeys.map((k) => (
        <Tabs.TabPane tab={k} key={k} />
      ))}
    </Tabs>
  );
};

const renderTopColumnChart = (store, scale = { y: {} }) => {
  const { data, modifyKeys } = store;
  return (
    <div>
      <Chart
        autoFit
        data={data.filter((d) => d.type === (store.device || modifyKeys[0]))}
        height={198}
        scale={{
          y: {
            nice: true,
            ...scale.y,
          },
        }}
      >
        <Interval position="x*y" size={20} />
      </Chart>
    </div>
  );
};

const TopCard = (props) => {
  const { store: propStore } = props;
  const baseConfig = {
    span: 12,
    constructorParams: {
      requestType: 'current',
      formatDataFn: handleResponses,
    },
    visibleHeight: 200,
    renderContent: (store) => (
      <div className={styles.topContent}>{store.data}</div>
    ),
  };
  const chartLists = [
    {
      title: t('Host CPU Usage'),
      span: 12,
      constructorParams: {
        metricKey: 'monitorOverview.topHostCPUUsage',
        typeKey: 'instance',
      },
      renderContent: renderTopProgress,
    },
    {
      title: t('Host Disk Average IOPS'),
      span: 12,
      constructorParams: {
        metricKey: 'monitorOverview.topHostDiskIOPS',
        formatDataFn: (reps, tk, dk, mk) => {
          const data = [];
          reps.forEach((ret, resIdx) => {
            (ret.data.result || []).forEach((d) => {
              data.push({
                x: d.metric.instance,
                y: parseFloat(get(d, 'value[1]', 0)),
                type: mk[resIdx],
              });
            });
          });
          return data;
        },
        modifyKeys: [t('read'), t('write')],
      },
      extra: renderTopColumnExtra,
      renderContent: renderTopColumnChart,
    },
    {
      title: t('Host Memory Usage'),
      span: 12,
      constructorParams: {
        metricKey: 'monitorOverview.topHostMemoryUsage',
        typeKey: 'instance',
      },
      renderContent: renderTopProgress,
    },
    {
      title: t('Host Average Network IO'),
      span: 12,
      constructorParams: {
        metricKey: 'monitorOverview.topHostInterface',
        formatDataFn: (reps, tk, dk, mk) => {
          const data = [];
          reps.forEach((ret, resIdx) => {
            (ret.data.result || []).forEach((d) => {
              data.push({
                x: d.metric.instance,
                y: parseFloat(get(d, 'value[1]', 0)),
                type: mk[resIdx],
              });
            });
          });
          return data;
        },
        modifyKeys: [t('receive'), t('transmit')],
      },
      extra: renderTopColumnExtra,
      renderContent: (store) =>
        renderTopColumnChart(store, {
          y: {
            formatter: (d) => getSuitableValue(d, 'traffic', 0),
          },
        }),
    },
  ];
  return (
    <Row gutter={[16, 16]}>
      {chartLists.map((chartProps) => {
        const config = merge({}, baseConfig, chartProps);
        const { span, title, ...rest } = config;
        return (
          <Col span={span} key={chartProps.constructorParams.metricKey}>
            <BaseCard
              {...rest}
              title={`${title} TOP5`}
              currentRange={propStore.currentRange}
              interval={propStore.interval}
            />
          </Col>
        );
      })}
    </Row>
  );
};

export default TopCard;
