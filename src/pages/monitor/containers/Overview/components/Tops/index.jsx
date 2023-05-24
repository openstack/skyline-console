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
import { get } from 'lodash';
import { Chart, Interval } from 'bizcharts';
import styles from '../../index.less';

export const renderTopProgress = ({ data }) => {
  return (
    <Row style={{ height: '100%' }}>
      {data.map((d) => {
        const percentage = get(d, 'y', 0);
        const percentageColor =
          percentage > 80 ? globalCSS.warnDarkColor : globalCSS.primaryColor;
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

export const renderTopColumnExtra = ({ modifyKeys, filterChartData }) => {
  return (
    <Tabs
      className={styles.tabs}
      defaultActiveKey={modifyKeys[0]}
      onChange={(key) => filterChartData((i) => i.type === key)}
    >
      {modifyKeys.map((k) => (
        <Tabs.TabPane tab={k} key={k} />
      ))}
    </Tabs>
  );
};

export const renderTopColumnChart = ({ data, modifyKeys }) => {
  return (
    <Chart
      autoFit
      data={
        data.length <= 5 ? data : data.filter((d) => d.type === modifyKeys[0])
      }
      height={198}
      scale={{
        y: {
          nice: true,
        },
      }}
    >
      <Interval position="x*y" size={20} />
    </Chart>
  );
};
