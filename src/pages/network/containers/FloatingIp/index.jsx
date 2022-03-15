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
import { floatingIpStatus, transitionStatuses } from 'resources/floatingip';
import { FloatingIpStore } from 'stores/neutron/floatingIp';
import { emptyActionConfig } from 'utils/constants';
import { Col, Popover, Row } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { qosEndpoint } from 'client/client/constants';
import { enablePFW } from 'resources/neutron';
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
    const { pathname } = this.props.location;
    return this.inDetailPage && pathname.includes('qos');
  }

  get isRecycleBinDetail() {
    const { pathname } = this.props.location;
    return this.inDetailPage && pathname.includes('recycle-bin');
  }

  get inInstanceDetail() {
    const { pathname } = this.props.location;
    return this.inDetailPage && pathname.includes('instance');
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
      console.log('params', params);
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
        dataIndex: 'qos_policy_id',
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
        render: (resource_name, record) => {
          if (
            !resource_name &&
            enablePFW() &&
            record.port_forwardings.length !== 0
          ) {
            return (
              <>
                {t('{number} port forwarding rules', {
                  number: record.port_forwardings.length,
                })}
                &nbsp;
                <Popover
                  content={
                    <Row className={styles.popover_row} gutter={[8, 8]}>
                      {record.port_forwardings
                        .sort((a, b) => a.external_port - b.external_port)
                        .map((i, idx) => (
                          <Col span={24} key={`pfw-${idx}`}>
                            {`${record.floating_ip_address}:${i.external_port} => ${i.internal_ip_address}:${i.internal_port}`}
                          </Col>
                        ))}
                    </Row>
                  }
                  title={t('Port Forwarding')}
                  destroyTooltipOnHide
                >
                  <FileTextOutlined />
                </Popover>
              </>
            );
          }
          return resource_name || '';
        },
        stringify: (resource_name, record) => {
          if (!resource_name && record.port_forwardings.length !== 0) {
            const ret = record.port_forwardings
              .sort((a, b) => a.external_port - b.external_port)
              .map(
                (i) =>
                  `${record.floating_ip_address}:${i.external_port} => ${i.internal_ip_address}:${i.internal_port}`
              );
            return ret.join('\n');
          }
          return resource_name;
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
