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
import { observer } from 'mobx-react';
import CircleChart from 'components/PrometheusChart/CircleWithRightLegend';
import { get } from 'lodash';
import BaseCard from 'components/PrometheusChart/BaseCard';

const ClusterChart = observer((props) => {
  const { store: propStore } = props;

  const config = {
    title: t('Compute Node status'),
    constructorParams: {
      requestType: 'current',
      formatDataFn: (responses) => {
        const status = [
          {
            type: 'up',
            value: 0,
          },
          {
            type: 'down',
            value: 0,
          },
        ];
        const result = get(responses[0], 'data.result', []);
        result.forEach((sta) => {
          const idx = sta.metric.adminState === 'enabled' ? 0 : 1;
          status[idx].value += parseInt(sta.value[1], 10);
        });
        return status;
      },
      metricKey: 'monitorOverview.computeNodeStatus',
    },
    renderContent: (store) => (
      <div style={{ height: 218 }}>
        <CircleChart data={store.data} />
      </div>
    ),
    visibleHeight: 230,
  };

  return (
    <BaseCard
      {...config}
      currentRange={propStore.currentRange}
      interval={propStore.interval}
    />
  );
});

export default ClusterChart;
