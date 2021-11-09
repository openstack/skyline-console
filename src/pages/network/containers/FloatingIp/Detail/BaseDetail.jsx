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
import { FloatingIpStore } from 'stores/neutron/floatingIp';
import Base from 'containers/BaseDetail';

export class BaseDetail extends Base {
  init() {
    this.store = new FloatingIpStore();
  }

  fetchData = () => {
    const { router_id } = this.props.detail;
    router_id &&
      this.store
        .getAddInfo({
          router_id,
        })
        .catch(this.catch);
  };

  get isLoading() {
    const { router_id } = this.props.detail;
    return router_id ? this.store.isLoading : false;
  }

  get detailData() {
    return {
      ...this.props.detail,
      router_name: this.store.addInfo.name,
      network_name: this.store.addInfo.externalNetworkName,
    };
  }

  get leftCards() {
    const cards = [this.baseInfoCard];
    return cards;
  }

  get baseInfoCard() {
    const options = [
      {
        label: t('Fixed IP'),
        dataIndex: 'fixed_ip_address',
      },
      {
        label: t('Network Line'),
        dataIndex: 'network_name',
      },
      {
        label: t('Router'),
        dataIndex: 'router_id',
        render: (data, record) => {
          if (data) {
            const { router_name, network_name } = record;
            if (router_name === '-' && network_name === '-') {
              return data;
            }
            const value = router_name ? `${data} (${router_name})` : data;
            const link = this.getLinkRender('routerDetail', value, {
              id: data,
            });
            return link;
          }
          return '-';
        },
      },
    ];
    return {
      title: t('Base Info'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
