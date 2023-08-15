import React, { useContext, useEffect, useState } from 'react';
import { get } from 'lodash';
import { Tabs } from 'antd';

import {
  createDataHandler,
  createFetchPrometheusClient,
} from 'components/PrometheusChart/utils';
import BaseTable from 'components/Tables/Base';
import { fetchPrometheus } from 'components/PrometheusChart/utils/utils';
import { formatSize } from 'src/utils';
import List from 'stores/base-list';
import BaseContentContext from 'components/PrometheusChart/component/context';

const { TabPane } = Tabs;

const RenderTabs = ({ fetchPrometheusFunc }) => {
  const [filters, setFilters] = useState({});
  const [initData, setInitData] = useState([]);
  const [listData, setListData] = useState([]);
  const [tab, setTab] = useState('pool');
  const [isLoading, setIsLoading] = useState(true);

  const ctx = useContext(BaseContentContext);
  const fetchData = createFetchPrometheusClient(
    {
      requestType: 'current',
      metricKey: 'storageCluster.tabs',
    },
    fetchPrometheusFunc
  );

  const dataHandler = createDataHandler({
    modifyKeys: ['pools', 'osds'],
    formatDataFn: (resps) => {
      const retData = [];
      const [pool, osd] = resps;
      get(pool, 'data.result', []).forEach((r) => {
        const { metric, value } = r;
        retData.push({
          tabType: 'pool',
          ...metric,
          value: parseFloat(value[1]) || 0,
        });
      });
      get(osd, 'data.result', []).forEach((r) => {
        const { metric, value } = r;
        retData.push({
          tabType: 'osd',
          ...metric,
          value: parseFloat(value[1]) || 0,
        });
      });
      return retData;
    },
  });

  function getListData(data) {
    let originData = data.filter((d) => d.tabType === tab);
    Object.keys(filters).forEach((key) => {
      originData = originData.filter((i) => i[key] === filters[key]);
    });
    setListData(originData);
  }

  async function handleInitData(data) {
    const newData = [...data];
    const poolPromises = get(METRICDICT, 'storageCluster.poolTab.url', []).map(
      (item) => (fetchPrometheusFunc || fetchPrometheus)(item, 'current')
    );
    const osdPromises = get(METRICDICT, 'storageCluster.osdTab.url', []).map(
      (item) => (fetchPrometheusFunc || fetchPrometheus)(item, 'current')
    );

    function handler(ret, index, primaryKey) {
      ret.data.result.forEach((item) => {
        const { metric, value } = item;
        const itemIndex = newData.findIndex(
          (p) => p[primaryKey] === metric[primaryKey]
        );
        // Special handling of expressions that do not have metric.__name__
        // Usage is the third query expression of details, so it is determined that index===3. The other two tabs are processed together
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

    const poolRets = await Promise.all(poolPromises);
    poolRets.forEach((ret, index) => {
      handler(ret, index, 'pool_id');
    });

    const osdRets = await Promise.all(osdPromises);
    osdRets.forEach((ret, index) => {
      handler(ret, index, 'ceph_daemon');
    });

    return newData;
  }

  async function getData() {
    setIsLoading(true);
    const d = await fetchData({
      currentRange: ctx.range,
      interval: ctx.interval,
    });
    const { retData } = dataHandler(d);
    const newInitData = await handleInitData(retData);
    setInitData(newInitData);
    getListData(newInitData);
    setIsLoading(false);
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getListData(initData);
  }, [tab, filters]);

  const columns = tab === 'pool' ? poolsColumns : osdsColumns;

  return (
    <>
      <Tabs
        defaultActiveKey="pool"
        onChange={(e) => {
          setFilters({});
          setTab(e);
        }}
      >
        <TabPane tab="Pools" key="pool" />
        <TabPane tab="OSDs" key="osd" />
      </Tabs>
      {/* {isLoading ? (
        <div className={styles['spin-container']}>
          <Spin />
        </div>
      ) : ( */}
      <BaseTable
        isLoading={isLoading}
        resourceName={tab === 'pool' ? t('Pools') : t('OSDs')}
        rowKey={tab === 'pool' ? 'pool_id' : 'name'}
        columns={columns}
        data={listData}
        pagination={{
          ...new List(),
          total: listData.length,
        }}
        hideRefresh
        searchFilters={
          tab === 'pool'
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
        onFilterChange={(newFilters) => {
          const { limit, page, sortKey, sortOrder, ...rest } = newFilters;
          setFilters(rest);
        }}
      />
      {/* )} */}
    </>
  );
};

export default RenderTabs;

const poolsColumns = [
  {
    title: t('Pool Name'),
    dataIndex: 'name',
  },
  {
    title: t('PG Count'),
    dataIndex: 'ceph_pg_total',
    isHideable: true,
  },
  {
    title: t('Object Count '),
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
