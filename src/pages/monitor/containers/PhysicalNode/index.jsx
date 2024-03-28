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
import moment from 'moment';
import { Progress } from 'antd';

import BaseContent from 'components/PrometheusChart/component/BaseContent';
import { getSuitableValue } from 'resources/prometheus/monitoring';
import { ChartType } from 'components/PrometheusChart/utils/utils';
import { computePercentage, formatSize, formatUsedTime } from 'src/utils';

import styles from 'components/PrometheusChart/component/styles.less';

export const topCardList = [
  {
    title: t('CPU Cores'),
    span: 5,
    createFetchParams: {
      metricKey: 'physicalNode.cpuCores',
    },
    renderContent: (value) => (
      <div className={styles['top-content']}>
        {get(value.data, 'length', 0)}
      </div>
    ),
  },
  {
    title: t('Total Ram'),
    span: 5,
    createFetchParams: {
      metricKey: 'physicalNode.totalMem',
    },
    renderContent: (value) => (
      <div className={styles['top-content']}>
        {getSuitableValue(get(value.data[0], 'y', 0), 'memory')}
      </div>
    ),
  },
  {
    title: t('System Running Time'),
    span: 5,
    createFetchParams: {
      metricKey: 'physicalNode.systemRunningTime',
    },
    renderContent: (value) => (
      <div className={styles['top-content']}>
        {formatUsedTime(
          (moment().unix() -
            parseInt(get(value.data[0], 'y', moment().unix()), 10)) *
            1000
        )}
      </div>
    ),
  },
  {
    title: t('File System Used Space'),
    span: 9,
    createFetchParams: {
      metricKey: 'physicalNode.fileSystemFreeSpace',
    },
    handleDataParams: {
      formatDataFn: (...rest) => {
        const [data, typeKey, deviceKey] = rest;
        const [avail, size] = data;
        const { data: { result } = { result: [] } } = avail;
        const temp = [];
        result.forEach((item, index) => {
          const availValue = parseFloat(get(item, 'value[1]', 0));
          const total = parseFloat(
            get(size, `data.result[${index}].value[1]`, 0)
          );
          const used = total - availValue;
          temp.push({
            mountpoint:
              get(item, `metric.${deviceKey}`) + get(item, `metric.${typeKey}`),
            avail: availValue,
            total,
            used,
          });
        });
        return temp;
      },
      typeKey: 'mountpoint',
      deviceKey: 'device',
    },
    renderContent: (value) => (
      <div
        style={{
          height: 100,
          overflow: 'auto',
        }}
      >
        {(value.data || []).map((item, index) => {
          const percentage = computePercentage(item.used, item.total);
          const percentageColor =
            percentage > 80 ? globalCSS.warnDarkColor : globalCSS.primaryColor;
          return (
            <div
              key={item.mountpoint}
              style={{ marginTop: index > 0 ? 16 : 0 }}
            >
              <div>
                <div style={{ float: 'left' }}>{item.mountpoint}</div>
                <div style={{ float: 'right' }}>
                  {`${formatSize(parseInt(item.used, 10))} / ${formatSize(
                    parseInt(item.total, 10)
                  )}`}
                </div>
              </div>
              <Progress
                style={{ width: '90%' }}
                percent={Number(
                  (
                    (parseInt(item.used, 10) / parseInt(item.total, 10)) *
                    100
                  ).toFixed(3)
                )}
                strokeColor={percentageColor}
              />
            </div>
          );
        })}
      </div>
    ),
  },
];

export const chartCardList = [
  {
    title: t('CPU Usage(%)'),
    createFetchParams: {
      metricKey: 'physicalNode.cpuUsage',
    },
    handleDataParams: {
      typeKey: 'mode',
    },
    chartProps: {
      chartType: ChartType.MULTILINE,
    },
  },
  {
    title: t('Memory Usage'),
    createFetchParams: {
      metricKey: 'physicalNode.memUsage',
    },
    handleDataParams: {
      modifyKeys: [t('Used'), t('Free')],
    },
    chartProps: {
      scale: {
        y: {
          formatter: (d) => getSuitableValue(d, 'memory', 0),
        },
      },
      chartType: ChartType.MULTILINE,
    },
  },
  {
    title: t('DISK IOPS'),
    createFetchParams: {
      metricKey: 'physicalNode.diskIOPS',
    },
    handleDataParams: {
      modifyKeys: [t('read'), t('write')],
      deviceKey: 'device',
    },
    chartProps: {
      chartType: ChartType.MULTILINEDEVICES,
    },
  },
  {
    title: t('DISK Usage(%)'),
    createFetchParams: {
      metricKey: 'physicalNode.diskUsage',
    },
    handleDataParams: {
      typeKey: 'hostname',
      deviceKey: 'device',
    },
    chartProps: {
      scale: {
        y: {
          alias: t('DISK Usage(%)'),
        },
      },
      chartType: ChartType.ONELINEDEVICES,
    },
  },
  {
    title: t('System Load'),
    span: 24,
    createFetchParams: {
      metricKey: 'physicalNode.systemLoad',
    },
    handleDataParams: {
      typeKey: '__name__',
    },
    chartProps: {
      chartType: ChartType.MULTILINE,
    },
  },
  {
    title: t('Network Traffic'),
    span: 12,
    createFetchParams: {
      metricKey: 'physicalNode.networkTraffic',
    },
    handleDataParams: {
      modifyKeys: [t('receive'), t('transmit')],
      deviceKey: 'device',
    },
    chartProps: {
      chartType: ChartType.MULTILINEDEVICES,
      scale: {
        y: {
          formatter: (d) => getSuitableValue(d, 'traffic', 0),
        },
      },
    },
  },
  {
    title: t('TCP Connections'),
    span: 12,
    createFetchParams: {
      metricKey: 'physicalNode.tcpConnections',
    },
    chartProps: {
      scale: {
        y: {
          alias: t('TCP Connections'),
        },
      },
      chartType: ChartType.ONELINE,
    },
  },
  {
    title: t('Network Errors'),
    span: 12,
    createFetchParams: {
      metricKey: 'physicalNode.networkErrors',
    },
    handleDataParams: {
      typeKey: '__name__',
      deviceKey: 'device',
    },
    chartProps: {
      scale: {
        y: {
          alias: t('Network Errors'),
        },
      },
      chartType: ChartType.ONELINE,
    },
  },
  {
    title: t('Network Dropped Packets'),
    span: 12,
    createFetchParams: {
      metricKey: 'physicalNode.networkDroppedPackets',
    },
    handleDataParams: {
      modifyKeys: [t('receive'), t('transmit')],
      deviceKey: 'device',
    },
    chartProps: {
      scale: {
        y: {
          alias: t('Network Dropped Packets'),
        },
      },
      chartType: ChartType.MULTILINEDEVICES,
    },
  },
];

export const chartConfig = {
  chartCardList,
  topCardList,
};
const PhysicalNode = () => <BaseContent chartConfig={chartConfig} />;

export default PhysicalNode;
