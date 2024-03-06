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
    const cards = [this.aZoneCard];
    return cards;
  }

  get rightCards() {
    return [this.externalNetInfo];
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
        label: t('External Fixed IPs'),
        dataIndex: 'external_gateway_info.external_fixed_ips',
        render: (value) => {
          if (!value || value.length === 0) {
            return '-';
          }
          return value.map((item, index) => (
            <div key={`ip-${index}`}>
              <div key={item.subnet_id}>
                <b>{t('Subnet ID')}</b>: {item.subnet_id}
              </div>
              <div key={item.ip_address}>
                <b>{t('IP Address')}</b>: {item.ip_address}
              </div>
              <div style={{ marginBottom: '8px' }} />
            </div>
          ));
        },
      },
    ];
    return {
      title: t('External Network Info'),
      options,
      labelCol: 4,
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
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
