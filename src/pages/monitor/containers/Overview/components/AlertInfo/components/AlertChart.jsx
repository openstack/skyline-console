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
import { Empty, Row } from 'antd';
import { Chart, Line, Tooltip } from 'bizcharts';
import { observer } from 'mobx-react';
import styles from '../../../index.less';

export default observer(({ data }) => {
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
});

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
