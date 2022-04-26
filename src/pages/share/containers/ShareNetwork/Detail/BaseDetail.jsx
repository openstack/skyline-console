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

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard];
  }

  get rightCards() {
    return [this.subnetInfos];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Project ID'),
        dataIndex: 'project_id',
      },
    ];

    return {
      title: t('Base Info'),
      options,
    };
  }

  get subnetInfos() {
    const {
      share_network_subnets = [],
      networks = [],
      subnets = [],
    } = this.detailData || {};
    const options = share_network_subnets.map((shareSubnet, index) => {
      return {
        label: `${t('Share Network Subnet')} ${index + 1}`,
        dataIndex: 'subnet',
        render: () => {
          const subnet = subnets[index] || {};
          const network = networks[index] || {};
          const infos = [
            {
              label: t('ID'),
              value: shareSubnet.id,
            },
            {
              label: t('Neutron Net'),
              value: this.getLinkRender('networkDetail', network.name, {
                id: network.id,
              }),
            },
            {
              label: t('Neutron Subnet'),
              value: subnet.name,
            },
            {
              label: t('IP Version'),
              value: shareSubnet.ip_vesion || '-',
            },
            {
              label: t('Network Type'),
              value: shareSubnet.network_type || '-',
            },
            {
              label: t('Segmentation Id'),
              value: shareSubnet.segmentation_id || '-',
            },
            {
              label: t('Availability Zone'),
              value: shareSubnet.availability_zone || '-',
            },
            {
              label: t('Cidr'),
              value: shareSubnet.cidr || '-',
            },
            {
              label: t('Gateway'),
              value: shareSubnet.gateway || '-',
            },
            {
              label: t('MTU'),
              value: shareSubnet.mtu || '-',
            },
          ];
          const items = infos.map((it) => {
            return (
              <div key={it.label}>
                <span style={{ fontWeight: 'bold' }}>{it.label}: </span>
                <span>{it.value}</span>
              </div>
            );
          });
          return <div key={shareSubnet.id}>{items}</div>;
        },
      };
    });
    return {
      title: t('Share Network Subnets'),
      options,
      labelCol: 4,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
