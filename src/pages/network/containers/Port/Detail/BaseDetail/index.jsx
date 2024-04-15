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
    return [this.baseInfoCard];
  }

  get qosEndpoint() {
    return qosEndpoint();
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Bind Device Type'),
        dataIndex: 'device_owner',
      },
      {
        label: t('Bind Device'),
        dataIndex: 'device_id',
        render: (data, record) => {
          const { itemInList: { device_id, device_owner, server_name } = {} } =
            record;
          if (device_id && device_owner === 'compute:nova') {
            const value = server_name
              ? `${device_id} (${server_name})`
              : device_id;
            return this.getLinkRender(
              'instanceDetail',
              value,
              { id: device_id },
              { tab: 'interface' }
            );
          }
          return data || '-';
        },
      },
      {
        label: t('VNIC Type'),
        dataIndex: 'binding:vnic_type',
      },
    ];
    if (this.qosEndpoint) {
      options.push({
        label: t('QoS Policy'),
        dataIndex: 'qos_policy_id',
        copyable: false,
        render: (data) => {
          if (!data) {
            return '-';
          }
          const { qosPolicy } = this.detailData;
          const { name } = qosPolicy || {};
          const displayName = name ? `${data}(${name})` : data;
          return this.getLinkRender('networkQosDetail', displayName, {
            id: data,
          });
        },
      });
    }
    return {
      title: t('Base Info'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
