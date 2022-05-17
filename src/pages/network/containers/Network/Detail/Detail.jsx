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

import { inject, observer } from 'mobx-react';
import Base from 'containers/BaseDetail';
import { qosEndpoint } from 'client/client/constants';

export class BaseDetail extends Base {
  get leftCards() {
    const cards = [this.baseInfoCard];
    return cards;
  }

  get qosEndpoint() {
    return qosEndpoint();
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Availability Zone'),
        dataIndex: 'availability_zones',
      },
      {
        label: t('Availability Zone Hints'),
        dataIndex: 'availability_zone_hints',
      },
      {
        label: t('MTU'),
        dataIndex: 'mtu',
      },
      {
        label: t('Router External'),
        dataIndex: 'router:external',
        valueRender: 'yesNo',
      },
      {
        label: t('Provider Network Type'),
        dataIndex: 'provider:network_type',
      },
      {
        label: t('Provider Physical Network'),
        dataIndex: 'provider:physical_network',
        render: (data) => data || '-',
      },
      {
        label: t('Segmentation ID'),
        dataIndex: 'provider:segmentation_id',
      },
      {
        label: t('Port Security Enabled'),
        dataIndex: 'port_security_enabled',
        valueRender: 'yesNo',
      },
    ];
    if (this.qosEndpoint) {
      options.push({
        label: t('QoS Policy'),
        dataIndex: 'qos_policy_id',
        render: (data) => data || '-',
      });
    }
    return {
      title: t('Base Info'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
