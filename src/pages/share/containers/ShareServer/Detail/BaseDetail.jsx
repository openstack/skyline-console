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

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard];
  }

  get rightCards() {
    return [this.detailCard];
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Host'),
        dataIndex: 'host',
      },
      {
        label: t('Share Network'),
        dataIndex: 'share_network_name',
        render: (value, record) => {
          if (!value) {
            return '-';
          }
          const { share_network_id } = record;
          const link = this.getLinkRender('shareNetworkDetail', value, {
            id: share_network_id,
          });
          return link;
        },
      },
    ];

    return {
      title: t('Base Info'),
      options,
    };
  }

  get detailCard() {
    const options = [
      {
        label: t('Instance ID'),
        dataIndex: 'backend_details.instance_id',
      },
      {
        label: t('IP'),
        dataIndex: 'backend_details.ip',
      },
      {
        label: t('Public Address'),
        dataIndex: 'backend_details.public_address',
      },
      {
        label: t('Username'),
        dataIndex: 'backend_details.username',
      },
      {
        label: t('Password'),
        dataIndex: 'backend_details.password',
      },
      {
        label: t('Router ID'),
        dataIndex: 'backend_details.router_id',
      },
      {
        label: t('Subnet ID'),
        dataIndex: 'backend_details.subnet_id',
      },
      {
        label: t('Service Port ID'),
        dataIndex: 'backend_details.service_port_id',
      },
    ];

    return {
      title: t('Detail Info'),
      options,
      labelCol: 4,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
