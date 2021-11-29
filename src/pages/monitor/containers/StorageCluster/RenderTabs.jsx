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

import React, { Component } from 'react';
import { Spin, Tabs } from 'antd';
import { observer } from 'mobx-react';
import { formatSize } from 'utils/index';
import FetchPrometheusStore from 'components/PrometheusChart/store/FetchPrometheusStore';
import { get } from 'lodash';
import metricDict from 'components/PrometheusChart/metricDict';
import { fetchPrometheus } from 'components/PrometheusChart/utils/utils';
import BaseTable from 'components/Tables/Base';
import List from 'stores/base-list';
import styles from './index.less';

const { TabPane } = Tabs;

@observer
class RenderTabs extends Component {
  constructor(props) {
    super(props);
    this.store = new FetchPrometheusStore({
      requestType: 'current',
      metricKey: 'storageCluster.tabs',
      modifyKeys: ['pools', 'osds'],
      formatDataFn: this.formatDataFn,
    });
    this.state = {
      filters: {},
    };
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    await this.store
      .fetchData({
        currentRange: this.props.store.currentRange,
        interval: this.props.store.interval,
      })
      .then(() => {
        this.getListData();
      });
  }

  async getListData() {
    const { data } = this.store;
    const newData = [...data];
    const poolPromises = get(metricDict, 'storageCluster.poolTab.url', []).map(
      (item) => fetchPrometheus(item, 'current')
    );
    const osdPromises = get(metricDict, 'storageCluster.osdTab.url', []).map(
      (item) => fetchPrometheus(item, 'current')
    );

    const poolRets = await Promise.all(poolPromises);
    poolRets.forEach((ret, index) => {
      handler(ret, index, 'pool_id');
    });

    const osdRets = await Promise.all(osdPromises);
    osdRets.forEach((ret, index) => {
      handler(ret, index, 'ceph_daemon');
    });
    this.store.updateData(newData);

    function handler(ret, index, primaryKey) {
      ret.data.result.forEach((item) => {
        const { metric, value } = item;
        const itemIndex = newData.findIndex(
          (p) => p[primaryKey] === metric[primaryKey]
        );
        // 特殊处理计算表达式没有metric.__name__的情况，
        // 此处usage是details的第3个查询表达式，所以判断index===3, 两个Tab放一起处理了，都放在第3个。
        // console.log(metric.__name__);
        if (index === 3) {
          newData[itemIndex].usage = parseFloat(
            parseFloat(value[1]).toFixed(2)
          );
        } else if (
          [
            'ceph_pool_objects',
            'ceph_pg_total',
            'ceph_pool_max_avail',
            'ceph_osd_weight',
            'ceph_osd_apply_latency_ms',
            'ceph_osd_commit_latency_ms',
            'ceph_osd_stat_bytes',
          ].indexOf(metric.__name__) > -1
        ) {
          newData[itemIndex][metric.__name__] = parseInt(value[1], 10);
        } else {
          newData[itemIndex][metric.__name__] = value[1];
        }
      });
    }
  }

  get tableData() {
    const { filters } = this.state;
    let originData = this.store.data.filter(
      (d) => d.type === (this.store.device || this.store.data[0].type)
    );
    Object.keys(filters).forEach((key) => {
      originData = originData.filter((i) => i[key] === filters[key]);
    });
    return originData;
  }

  formatDataFn(resps) {
    const retData = [];
    const [pool, osd] = resps;
    get(pool, 'data.result', []).forEach((r) => {
      const { metric, value } = r;
      retData.push({
        type: 'pool',
        ...metric,
        value: parseFloat(value[1]) || 0,
      });
    });
    get(osd, 'data.result', []).forEach((r) => {
      const { metric, value } = r;
      retData.push({
        type: 'osd',
        ...metric,
        value: parseFloat(value[1]) || 0,
      });
    });
    return retData;
  }

  render() {
    const { device = 'pool' } = this.store;
    const columns = device === 'pool' ? poolsColumns : osdsColumns;
    return (
      <>
        <Tabs
          defaultActiveKey="pool"
          onChange={(e) => {
            this.setState(
              {
                filters: {},
              },
              () => {
                this.store.handleDeviceChange(e);
              }
            );
          }}
        >
          <TabPane tab="Pools" key="pool" />
          <TabPane tab="OSDs" key="osd" />
        </Tabs>
        {this.store.isLoading ? (
          <div className={styles.spinContainer}>
            <Spin />
          </div>
        ) : (
          <BaseTable
            resourceName={this.store.device === 'pool' ? t('Pools') : t('OSDs')}
            rowKey={this.store.device === 'pool' ? 'pool_id' : 'name'}
            columns={columns}
            data={this.tableData}
            pagination={{
              ...new List(),
              total: this.tableData.length,
            }}
            hideRefresh
            searchFilters={
              this.store.device === 'pool'
                ? [
                    {
                      label: t('Pool Name'),
                      name: 'name',
                    },
                  ]
                : [
                    {
                      label: t('Name'),
                      name: 'ceph_daemon',
                    },
                  ]
            }
            itemActions={[]}
            onFilterChange={(filters) => {
              const { limit, page, sortKey, sortOrder, ...rest } = filters;
              this.setState({
                filters: rest,
              });
            }}
            onFetchBySort={() => {}}
          />
        )}
      </>
    );
  }
}

export default RenderTabs;

const poolsColumns = [
  {
    title: t('Pool Name'),
    dataIndex: 'name',
  },
  {
    title: t('PGs'),
    dataIndex: 'ceph_pg_total',
    isHideable: true,
  },
  {
    title: t('Objects'),
    dataIndex: 'ceph_pool_objects',
    isHideable: true,
  },
  {
    title: t('Max Avail'),
    dataIndex: 'ceph_pool_max_avail',
    render: (text) => formatSize(text),
    isHideable: true,
  },
  {
    title: t('Usage'),
    dataIndex: 'usage',
    render: (text) => `${text}%`,
    isHideable: true,
  },
];

const osdsColumns = [
  {
    title: t('Name'),
    dataIndex: 'ceph_daemon',
  },
  {
    title: t('Status'),
    dataIndex: 'ceph_osd_up',
    render: (up) => (up === '1' ? t('Up') : t('Down')),
    isHideable: true,
  },
  {
    title: t('Instance Addr'),
    dataIndex: 'cluster_addr',
    isHideable: true,
  },
  {
    title: t('Weight'),
    dataIndex: 'ceph_osd_weight',
    isHideable: true,
  },
  {
    title: t('Apply Latency(ms)'),
    dataIndex: 'ceph_osd_apply_latency_ms',
    isHideable: true,
  },
  {
    title: t('Commit Latency(ms)'),
    dataIndex: 'ceph_osd_commit_latency_ms',
    isHideable: true,
  },
  {
    title: t('Total Capacity'),
    dataIndex: 'ceph_osd_stat_bytes',
    render: (text) => formatSize(text),
    isHideable: true,
  },
  {
    title: t('Usage'),
    dataIndex: 'usage',
    render: (text) => `${parseFloat(text).toFixed(2)}%`,
    isHideable: true,
  },
];
