// Copyright 2022 99cloud
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
    const cards = [this.networkCard, this.baseInfoCard];
    if (this.canAddNetworkIPUsageInfo) {
      cards.push(this.ipUsageCard);
    }
    return cards;
  }

  get canAddNetworkIPUsageInfo() {
    return this.store.hasAdminRole;
  }

  get networkCard() {
    const options = [
      {
        label: t('Network Name'),
        dataIndex: 'network.name',
      },
      {
        label: t('Network ID'),
        dataIndex: 'network.id',
        render: (value) => {
          const link = this.getLinkRender('networkDetail', value, {
            id: value,
          });
          return link;
        },
      },
    ];
    return {
      title: t('Network Info'),
      options,
    };
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Gateway IP'),
        dataIndex: 'gateway_ip',
      },
      {
        label: t('Allocation Pools'),
        dataIndex: 'allocation_pools',
        render: (value) => {
          const items = (value || []).map((it) => {
            const { start, end } = it;
            return (
              <div key={`${start}-${end}`}>
                {start} - {end}
              </div>
            );
          });
          return <>{items}</>;
        },
      },
      {
        label: t('Enable DHCP'),
        dataIndex: 'enable_dhcp',
        valueRender: 'yesNo',
      },
      {
        label: t('Host Routes'),
        dataIndex: 'host_routes',
        render: (value) => {
          if (!value.length) {
            return '-';
          }
          const lines = value.map((it) => {
            const { destination, nexthop } = it;
            return (
              <div key={`${destination},${nexthop}`}>
                {destination},{nexthop}
              </div>
            );
          });
          return <>{lines}</>;
        },
      },
      {
        label: t('DNS Nameservers'),
        dataIndex: 'dns_nameservers',
        render: (value) => {
          if (!value.length) {
            return '-';
          }
          const lines = value.map((it) => <div key={it}>{it}</div>);
          return <>{lines}</>;
        },
      },
    ];
    return {
      title: t('Base Info'),
      options,
    };
  }

  get ipUsageCard() {
    if (!this.canAddNetworkIPUsageInfo) {
      return null;
    }
    const options = [
      {
        label: t('Total IPs'),
        dataIndex: 'total_ips',
      },
      {
        label: t('Used IPs'),
        dataIndex: 'used_ips',
      },
    ];
    return {
      title: t('IP Usage'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
