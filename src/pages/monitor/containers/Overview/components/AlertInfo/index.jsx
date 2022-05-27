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
import { Col, Empty, Row, Spin } from 'antd';
import styles from 'pages/monitor/containers/Overview/index.less';
import { handleResponse } from 'components/PrometheusChart/utils/dataHandler';
import moment from 'moment';
import {
  createDataHandler,
  createFetchPrometheusClient,
} from 'components/PrometheusChart/utils';
import { Chart, Line, Tooltip } from 'bizcharts';

const STEP = 15;

const Index = function () {
  const fetchData = createFetchPrometheusClient({
    requestType: 'range',
    metricKey: 'monitorOverview.alertInfo',
  });

  const dataHandler = createDataHandler({
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

  const fetchDataByDate = async (date) => {
    const end = moment(date).endOf('day');
    const start = moment(date).startOf('day');
    const result = await fetchData({
      interval: STEP,
      currentRange: [start, end],
    });
    const [cpuData, memoryData] = dataHandler(result).retData;
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
    const total = newCpuCount + newMemoryCount;
    return {
      date,
      total,
      cpuTotal: newCpuCount,
      memTotal: newMemoryCount,
    };
  };

  const fetchWeekData = async () => {
    setIsLoading(true);
    const reqs = weekData.map((it) => {
      const { fullDate } = it;
      return fetchDataByDate(fullDate);
    });
    try {
      const results = await Promise.all(reqs);
      results.forEach((r, index) => {
        const { total, cpuTotal, memTotal } = r;
        if (index === results.length - 1) {
          setCpuCount(cpuTotal);
          setMemCount(memTotal);
        }
        weekData[index].count = total;
      });
    } catch (e) {
      console.log(e);
    }
    setWeekData([...weekData]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchWeekData();
  }, []);

  return isLoading ? (
    <Spin />
  ) : (
    <Row gutter={[16, 16]}>
      <Col flex="1 1">
        <div className={styles.card}>
          <Row style={{ height: '100%' }}>
            <Col span={12} className={styles['alert-card-line']}>
              <div className={styles.number}>{cpuCount}</div>
              <div>{t('Today CPU usage > 80% alert')}</div>
            </Col>
            <Col span={12} className={styles['alert-card-line']}>
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
      fullDate: today.clone().subtract(index, 'day').format('YYYY-MM-DD'),
      date: today.clone().subtract(index, 'day').format('MM-DD'),
      count: 0,
    });
  }
  return ret;
}

function AlertChart({ data }) {
  return (
    <div className={styles.card}>
      <Row justify="space-between">
        <span>{t('Last week alarm trend')}</span>
        <span>{t('time / 24h')}</span>
      </Row>
      <Row
        justify="center"
        align="middle"
        style={{ height: 272, paddingTop: 10 }}
      >
        {data.length === 0 ? <Empty /> : <Charts data={data} />}
      </Row>
    </div>
  );
}

function Charts({ data }) {
  return (
    <Chart
      padding={[10, 20, 50, 50]}
      autoFit
      data={data}
      scale={{
        count: {
          nice: true,
        },
      }}
    >
      <Line position="date*count" />
      <Tooltip showCrosshairs lock />
    </Chart>
  );
}

export default Index;
