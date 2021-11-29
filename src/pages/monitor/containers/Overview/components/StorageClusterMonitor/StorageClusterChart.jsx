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
import ChartCard from 'components/PrometheusChart/ChartCard';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import { ChartType } from 'components/PrometheusChart/utils/utils';

const StorageClusterChart = observer((props) => {
  const { store: propStore } = props;

  const config = {
    title: t('Storage Cluster IOPS'),
    constructorParams: {
      requestType: 'range',
      metricKey: 'monitorOverview.cephStorageClusterIOPS',
      formatDataFn: handleResponses,
      modifyKeys: [t('read'), t('write')],
    },
    chartProps: {
      chartType: ChartType.MULTILINE,
      height: 250,
      scale: {
        y: {
          nice: true,
        },
      },
    },
    visibleHeight: 230,
  };

  return (
    <ChartCard
      {...config}
      currentRange={propStore.currentRange}
      interval={propStore.interval}
      BaseContentConfig={{
        ...props.BaseContentConfig,
        renderTimeRangeSelect: true,
      }}
    />
  );
});

export default StorageClusterChart;
