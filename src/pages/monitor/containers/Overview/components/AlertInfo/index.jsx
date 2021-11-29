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

import React, { useState, useEffect } from 'react';
import { Col, Row, Spin } from 'antd';
import styles from 'pages/monitor/containers/Overview/index.less';
import FetchPrometheusStore from 'components/PrometheusChart/store/FetchPrometheusStore';
import { handleResponse } from 'components/PrometheusChart/utils/dataHandler';
import moment from 'moment';
import AlertChart from './components/AlertChart';

const STEP = 15;

const Index = function () {
  const store = new FetchPrometheusStore({
    requestType: 'range',
    metricKey: 'monitorOverview.alertInfo',
    formatDataFn: (responses, typeKey, deviceKey, modifyKeys) => {
      const ret = [];
      responses.forEach((response, idx) => {
        ret.push(handleResponse(response, typeKey, deviceKey, modifyKeys[idx]));
      });
      return ret;
    },
    modifyKeys: ['cpu', 'memory'],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [cpuCount, setCpuCount] = useState(0);
  const [memCount, setMemCount] = useState(0);
  const [weekData, setWeekData] = useState(build7DaysData());

  useEffect(() => {
    const end = moment();
    const start = moment().startOf('day');
    setIsLoading(true);
    store
      .fetchData({
        interval: STEP,
        currentRange: [start, end],
      })
      .then((d) => {
        const [cpuData, memoryData] = d;
        const newCpuCount = cpuData.reduce(
          (pre, cur, idx) =>
            idx > 0 && cur.x - cpuData[idx - 1].x > STEP ? pre + 1 : pre,
          0
        );
        const newMemoryCount = memoryData.reduce(
          (pre, cur, idx) =>
            idx > 0 && cur.x - memoryData[idx - 1].x > STEP ? pre + 1 : pre,
          0
        );
        setCpuCount(newCpuCount);
        setMemCount(newMemoryCount);
        weekData[6].count = newCpuCount + newMemoryCount;
        setWeekData([...weekData]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return isLoading ? (
    <Spin />
  ) : (
    <Row gutter={[16, 16]}>
      <Col flex="1 1">
        <div className={styles.card}>
          <Row style={{ height: '100%' }}>
            <Col span={12} className={styles.alertCardLine}>
              <div className={styles.number}>{cpuCount}</div>
              <div>{t('Today CPU usage > 80% alert')}</div>
            </Col>
            <Col span={12} className={styles.alertCardLine}>
              <div className={styles.number}>{memCount}</div>
              <div>{t('Today Memory usage > 80% alert')}</div>
            </Col>
          </Row>
        </div>
      </Col>
      <Col flex="0 1 440px">
        <AlertChart data={weekData} />
      </Col>
    </Row>
  );
};

function build7DaysData() {
  const today = moment().startOf('day');
  const ret = [];
  for (let index = 6; index >= 0; index--) {
    ret.push({
      date: today.clone().subtract(index, 'day').format('MM-DD'),
      count: 0,
    });
  }
  return ret;
}

export default Index;
