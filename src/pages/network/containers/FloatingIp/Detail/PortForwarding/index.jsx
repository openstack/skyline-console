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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import { PortForwardingStore } from 'stores/neutron/port-forwarding';
import { getOptions } from 'utils/index';
import { portForwardingProtocols } from 'resources/neutron/floatingip';
import actionConfigs from './actions';

export class PortForwarding extends Base {
  init() {
    this.store = new PortForwardingStore();
  }

  get policy() {
    return 'get_floatingip_port_forwarding';
  }

  get name() {
    return t('port forwardings');
  }

  updateFetchParams = (params) => {
    const { id, all_projects, ...rest } = params;
    return {
      fipId: id,
      fipInfo: this.props.detail,
      ...rest,
    };
  };

  get isFilterByBackend() {
    return false;
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID'),
      dataIndex: 'id',
    },
    {
      title: t('External Port/Port Range'),
      dataIndex: 'external_port',
      splitColumnForDownload: false,
      render: (value, record) => {
        return value || record.external_port_range;
      },
    },
    {
      title: t('Internal Ip Address'),
      dataIndex: 'internal_ip_address',
      isHideable: true,
    },
    {
      title: t('Internal Port/Port Range'),
      dataIndex: 'internal_port',
      splitColumnForDownload: false,
      isHideable: true,
      render: (value, record) => {
        return value || record.internal_port_range;
      },
    },
    {
      title: t('Protocol'),
      dataIndex: 'protocol',
      isHideable: true,
      valueMap: portForwardingProtocols,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
      isHideable: true,
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Protocol'),
        name: 'protocol',
        options: getOptions(portForwardingProtocols),
      },
      {
        label: t('External Port/Port Range'),
        name: 'external_port',
        filterFunc: (_, filter, data) => {
          const { external_port, external_port_range } = data || {};
          return (
            `${external_port || ''}`.includes(filter) ||
            `${external_port_range || ''}`.includes(filter)
          );
        },
      },
      {
        label: t('Internal Ip Address'),
        name: 'internal_ip_address',
        filterFunc: (value, filter) => {
          return value.includes(filter);
        },
      },
      {
        label: t('Internal Port/Port Range'),
        name: 'internal_port',
        filterFunc: (_, filter, data) => {
          const { internal_port, internal_port_range } = data || {};
          return (
            `${internal_port || ''}`.includes(filter) ||
            `${internal_port_range || ''}`.includes(filter)
          );
        },
      },
      {
        label: t('Description'),
        name: 'description',
      },
    ];
  }
}

export default inject('rootStore')(observer(PortForwarding));
