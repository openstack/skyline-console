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
import globalPortStore from 'stores/neutron/port-extension';
import List from 'stores/base-list';
import actionConfigs from './actions';

export class AllowedAddressPair extends Base {
  init() {
    this.store = globalPortStore;
    // because of the father component use new Store
    // so set detail to globalStore to share data
    this.store.setDetail(this.props.detail);
  }

  getDownloadData = () => this.props.detail.allowed_address_pairs;

  get list() {
    const ret = new List();
    if (this.props.detail.allowed_address_pairs) {
      ret.update({
        data: (this.props.detail.allowed_address_pairs || []).map(
          (item, index) => ({
            ...item,
            id: `port_detail_allowed_address_pair_${index}`,
          })
        ),
      });
    }
    return ret;
  }

  get isLoading() {
    return false;
  }

  async getData() {
    // await this.store.fetchDetail(this.store.detail);
  }

  get policy() {
    return 'get_port';
  }

  get name() {
    return t('Allowed Address Pairs');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.adminConfigs;
    }
    return actionConfigs.actionConfigs;
  }

  get hideCustom() {
    return true;
  }

  getColumns = () => [
    {
      title: t('IP Address'),
      dataIndex: 'ip_address',
    },
    {
      title: t('Mac Address'),
      dataIndex: 'mac_address',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('IP Address'),
        name: 'ip_address',
      },
      {
        label: t('Mac Address'),
        name: 'mac_address',
      },
    ];
  }
}

export default inject('rootStore')(observer(AllowedAddressPair));
