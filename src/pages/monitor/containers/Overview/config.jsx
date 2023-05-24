import React from 'react';
import { get } from 'lodash';
import { Progress, Row } from 'antd';
import { computePercentage } from 'src/utils';
import {
  cephStatusColorMap,
  cephStatusMap,
  getSuitableValue,
} from 'resources/prometheus/monitoring';
import CircleChart from 'components/PrometheusChart/CircleWithRightLegend';
import { handleResponses } from 'components/PrometheusChart/utils/dataHandler';
import { ChartType } from 'components/PrometheusChart/utils/utils';
import globalRootStore from 'stores/root';
import {
  renderTopColumnChart,
  renderTopColumnExtra,
  renderTopProgress,
} from './components/Tops';
import styles from './index.less';

export const physicalNodeLeftTopCardList = [
  {
    title: t('Physical CPU Usage'),
    span: 12,
    createFetchParams: {
      metricKey: 'monitorOverview.physicalCPUUsage',
    },
    renderContent: ({ data }) => {
      const used = get(data[0], 'y', 0);
      const total = get(data[1], 'y', 0);
      return (
        <div className={styles['top-content']}>
          <div>
            <Row
              style={{
                alignItems: 'baseline',
                justifyContent: 'center',
              }}
            >
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
    createFetchParams: {
      metricKey: 'monitorOverview.physicalMemoryUsage',
    },
    renderContent: (store) => {
      const { data } = store;
      const usedValue = get(data[0], 'y', 0);
      const totalValue = get(data[1], 'y', 0);
      const used = getSuitableValue(usedValue, 'memory');
      const total = getSuitableValue(totalValue, 'memory');
      return (
        <div className={styles['top-content']}>
          <div>
            <Row
              style={{
                alignItems: 'baseline',
                justifyContent: 'center',
              }}
            >
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
    createFetchParams: {
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
        <div className={styles['top-content']}>
          <div
            style={{
              width: '100%',
              height: '100%',
            }}
          >
            <Row
              style={{
                justifyContent: 'flex-end',
                height: '50%',
              }}
            >
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
                strokeColor={
                  progressPercentage > 80
                    ? globalCSS.warnDarkColor
                    : globalCSS.primaryColor
                }
                showInfo={progressPercentage !== 100}
              />
            </Row>
          </div>
        </div>
      );
    },
  },
];

export const physicalNodeRightTopCardList = [
  {
    visibleHeight: 319,
    createFetchParams: {
      requestType: 'current',
      metricKey: 'monitorOverview.computeNodeStatus',
    },
    handleDataParams: {
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
        result.forEach((r) => {
          const idx = r.metric.adminState === 'enabled' ? 0 : 1;
          status[idx].value += parseInt(r.value[1], 10);
        });
        return status;
      },
    },
    title: t('Compute Node status'),
    renderContent: ({ data }) => (
      <div style={{ height: 309 }}>
        <CircleChart data={data} />
      </div>
    ),
  },
];

export const topCardList = [
  {
    title: t('Host CPU Usage'),
    span: 12,
    createFetchParams: {
      metricKey: 'monitorOverview.topHostCPUUsage',
    },
    handleDataParams: {
      typeKey: 'instance',
    },
    renderContent: renderTopProgress,
  },
  {
    title: t('Host Disk Average IOPS'),
    span: 12,
    createFetchParams: {
      metricKey: 'monitorOverview.topHostDiskIOPS',
    },
    handleDataParams: {
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
    createFetchParams: {
      metricKey: 'monitorOverview.topHostMemoryUsage',
    },
    handleDataParams: {
      typeKey: 'instance',
    },
    renderContent: renderTopProgress,
  },
  {
    title: t('Host Average Network IO'),
    span: 12,
    createFetchParams: {
      metricKey: 'monitorOverview.topHostInterface',
    },
    handleDataParams: {
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
    renderContent: (p) => {
      const Cmp = renderTopColumnChart(p);
      return React.cloneElement(Cmp, {
        ...Cmp.props,
        scale: {
          y: {
            nice: true,
            formatter: (d) => getSuitableValue(d, 'traffic', 0),
          },
        },
      });
    },
  },
];

export const storageLeftCardList = [
  {
    title: t('Storage Cluster Status'),
    span: 24,
    createFetchParams: {
      metricKey: 'monitorOverview.cephHealthStatus',
    },
    renderContent: (store) => {
      const data = get(store.data, 'y', 0);
      return (
        <div
          className={styles['top-content']}
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
    createFetchParams: {
      metricKey: 'monitorOverview.cephStorageUsage',
    },
    renderContent: (store) => {
      const { data } = store;
      const usedValue = get(data[0], 'y', 0);
      const totalValue = get(data[1], 'y', 0);
      const used = getSuitableValue(usedValue, 'disk');
      const total = getSuitableValue(totalValue, 'disk');
      return (
        <div className={styles['top-content']}>
          <div>
            <Row
              style={{
                alignItems: 'baseline',
                justifyContent: 'center',
              }}
            >
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
    title: t('Disk allocation (GiB)'),
    span: 12,
    createFetchParams: {
      metricKey: 'monitorOverview.cephStorageAllocate',
    },
    renderContent: (store) => {
      const { data } = store;
      const totalValue = parseFloat(get(data[1], 'y', 0).toFixed(2));
      const usedValue = parseFloat(
        (totalValue - get(data[0], 'y', 0)).toFixed(2)
      );
      return (
        <div className={styles['top-content']}>
          <div>
            <Row
              style={{
                alignItems: 'baseline',
                justifyContent: 'center',
              }}
            >
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
              {`${usedValue} GiB / ${totalValue} GiB`}
            </Row>
          </div>
        </div>
      );
    },
    hidden: !globalRootStore.checkEndpoint('cinder'),
  },
];

export const storageRightChartList = [
  {
    title: t('Storage Cluster IOPS'),
    createFetchParams: {
      requestType: 'range',
      metricKey: 'monitorOverview.cephStorageClusterIOPS',
    },
    handleDataParams: {
      formatDataFn: handleResponses,
      modifyKeys: [t('read'), t('write')],
    },
    span: 24,
    chartProps: {
      chartType: ChartType.MULTILINE,
      height: 318,
      scale: {
        y: {
          nice: true,
        },
      },
    },
  },
];
