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
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import {
  floatingIpStatus,
  transitionStatuses,
} from 'resources/neutron/floatingip';
import { FloatingIpStore } from 'stores/neutron/floatingIp';
import { emptyActionConfig } from 'utils/constants';
import { Col, Popover, Row } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { qosEndpoint } from 'client/client/constants';
import { getOptions } from 'utils';
import styles from './styles.less';
import actionConfigs from './actions';

export class FloatingIps extends Base {
  init() {
    this.store = new FloatingIpStore();
    this.downloadStore = new FloatingIpStore();
  }

  get qosEndpoint() {
    return qosEndpoint();
  }

  get isFilterByBackend() {
    return !this.inQosDetail;
  }

  get isSortByBackend() {
    return !this.inQosDetail;
  }

  get defaultSortKey() {
    return 'status';
  }

  get inQosDetail() {
    return this.inDetailPage && this.path.includes('qos');
  }

  get isRecycleBinDetail() {
    return this.inDetailPage && this.path.includes('recycle-bin');
  }

  get inInstanceDetail() {
    return this.inDetailPage && this.path.includes('instance');
  }

  async getData({ silent, ...params } = {}) {
    if (this.inDetailPage && !this.inQosDetail) {
      silent && (this.list.silent = true);
      const { detail: { addresses = [] } = {} } = this.props;
      const ips = [];
      // filter list by fixed_ip_address
      Object.keys(addresses).forEach((key) => {
        ips.push(
          ...addresses[key]
            .filter((item) => item['OS-EXT-IPS:type'] === 'fixed')
            .map((item) => item.addr)
        );
      });
      params.fixed_ip_address = ips;
      params.all_projects = this.isAdminPage;
      if (ips.length > 0) {
        await this.store.fetchListWithResourceName(params);
      } else {
        this.list.isLoading = false;
      }
    } else {
      super.getData({ silent, ...params });
    }
  }

  get fetchDataByCurrentProject() {
    // add project_id to fetch data;
    return true;
  }

  updateFetchParams = (params) => {
    if (this.inQosDetail) {
      const { id, ...rest } = params;
      return {
        qos_policy_id: id,
        ...rest,
      };
    }
    return params;
  };

  fetchDataByPage = async (params) => {
    await this.store.fetchListWithResourceName(params);
    this.list.silent = false;
  };

  get policy() {
    return 'get_floatingip';
  }

  get name() {
    return t('floating ips');
  }

  get actionConfigs() {
    if (this.isRecycleBinDetail) {
      return emptyActionConfig;
    }
    if (this.inInstanceDetail) {
      return this.isAdminPage
        ? actionConfigs.instanceDetailAdminConfigs
        : actionConfigs.instanceDetailConfigs;
    }
    if (this.inQosDetail) {
      return this.isAdminPage
        ? actionConfigs.qosDetailAdminConfigs
        : actionConfigs.qosDetailConfigs;
    }
    return this.isAdminPage
      ? actionConfigs.adminConfigs
      : actionConfigs.actionConfigs;
  }

  get transitionStatusList() {
    return transitionStatuses;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  getRecordPortForwarding(record) {
    return (record.port_forwardings || []).sort(
      (a, b) => a.external_port - b.external_port
    );
  }

  getPortForwardingRender(record) {
    const data = this.getRecordPortForwarding(record);
    if (!data.length) {
      return null;
    }
    return (
      <Popover
        content={
          <Row className={styles['popover-row']} gutter={[8, 8]}>
            {data.map((i, idx) => (
              <Col span={24} key={`pfw-${idx}`}>
                {`${record.floating_ip_address}:${i.external_port} => ${i.internal_ip_address}:${i.internal_port}`}
              </Col>
            ))}
          </Row>
        }
        title={t('Port Forwarding')}
        destroyTooltipOnHide
      >
        {t('{number} port forwarding rules', {
          number: data.length,
        })}
        &nbsp;
        <FileTextOutlined />
      </Popover>
    );
  }

  getPortForwardingStringify(record) {
    const data = this.getRecordPortForwarding(record);
    if (!data.length) {
      return '';
    }
    const ret = data.map(
      (i) =>
        `${record.floating_ip_address}:${i.external_port} => ${i.internal_ip_address}:${i.internal_port}`
    );
    const total = t('{number} port forwarding rules', {
      number: data.length,
    });
    return [total, ...ret].join('\n');
  }

  getResourceRender(value, record) {
    const hasResource = value ? value !== '-' : false;
    if (hasResource) {
      return value;
    }
    const pfsRender = this.getPortForwardingRender(record);
    return pfsRender || '-';
  }

  geResourceStringify(value, record) {
    const hasResource = value ? value !== '-' : false;
    if (hasResource) {
      return value;
    }
    const portForwarding = this.getPortForwardingStringify(record);
    return portForwarding || '-';
  }

  getColumns() {
    return [
      {
        title: t('ID/Floating IP'),
        dataIndex: 'floating_ip_address',
        isLink: true,
        routeName: this.getRouteName('fipDetail'),
      },
      {
        title: t('QoS Policy'),
        dataIndex: 'qos_policy_name',
        isLink: true,
        routeName: this.getRouteName('networkQosDetail'),
        idKey: 'qos_policy_id',
        hidden: !this.qosEndpoint || this.inQosDetail,
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage,
        sortKey: 'project_id',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        render: (value) => value || '-',
        isHideable: true,
        sorter: false,
      },
      {
        title: t('Associated Resource'),
        dataIndex: 'resource_name',
        render: (value, record) => {
          return this.getResourceRender(value, record);
        },
        stringify: (value, record) => {
          return this.geResourceStringify(value, record);
        },
        isHideable: true,
        sorter: false,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        render: (value) => floatingIpStatus[value] || '-',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
        isHideable: true,
        sorter: false,
      },
    ];
  }

  get searchFilters() {
    const filters = [
      {
        label: t('Floating IP'),
        name: 'floating_ip_address',
      },
      {
        label: t('Status'),
        name: 'status',
        options: getOptions(floatingIpStatus),
      },
    ];
    return filters;
  }
}

export default inject('rootStore')(observer(FloatingIps));
