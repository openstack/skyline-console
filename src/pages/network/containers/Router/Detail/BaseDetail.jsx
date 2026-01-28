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
import { inject, observer } from 'mobx-react';
import Base from 'containers/BaseDetail';
import { Table } from 'antd';

export class BaseDetail extends Base {
  get isLoading() {
    return false;
  }

  get leftCards() {
    return [this.aZoneCard, this.externalNetInfo];
  }

  get rightCards() {
    if (!this.isAdminPage) return [];
    if (this.detailData?.l3Agents === null) return [];
    return [this.agentCard];
  }

  get agentCard() {
    const agents = this.detailData?.l3Agents;
    if (agents === null) return null;

    const title = t('L3 Agent');
    const options = [
      {
        content: this.agentContent(agents || []),
      },
    ];

    return {
      title,
      options,
      labelCol: 0,
    };
  }

  agentContent(items) {
    const columns = [
      {
        title: t('Host'),
        dataIndex: 'host',
      },
      {
        title: t('ID'),
        dataIndex: 'id',
      },
      {
        title: t('High Availability Status'),
        dataIndex: 'ha_state',
        render: (value) => value || '-',
      },
    ];

    return (
      <Table
        columns={columns}
        size="middle"
        dataSource={items}
        pagination={false}
        rowKey="id"
      />
    );
  }

  get externalNetInfo() {
    const options = [
      {
        label: t('Network Name'),
        dataIndex: 'externalNetworkName',
      },
      {
        label: t('Network ID'),
        dataIndex: 'externalNetworkId',
      },
      {
        label: t('SNAT Enabled'),
        dataIndex: 'external_gateway_info.enable_snat',
        valueRender: 'yesNo',
      },
      {
        label: t('External IPs'),
        dataIndex: 'external_gateway_info.external_fixed_ips',
        render: (value) => {
          if (!value || value.length === 0) {
            return '-';
          }
          return value.map((item, index) => (
            <div key={`ip-${index}`}>
              <ul style={{ paddingLeft: '12px' }}>
                <li>
                  <b>{t('Subnet ID')}</b>: {item.subnet_id}
                </li>
                <li>
                  <b>{t('IP Address')}</b>: {item.ip_address}
                </li>
              </ul>
            </div>
          ));
        },
      },
    ];

    return {
      title: t('Network Info'),
      options,
    };
  }

  get aZoneCard() {
    const options = [
      {
        label: t('Current Availability Zones'),
        dataIndex: 'availability_zones',
        render: (value) => (value || []).join(',') || '-',
      },
      {
        label: t('Availability Zone Hints'),
        dataIndex: 'availability_zone_hints',
        render: (value) => (value || []).join(',') || '-',
      },
    ];

    return {
      title: t('Availability Zone Info'),
      options,
      labelCol: 12,
      contentCol: 12,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
