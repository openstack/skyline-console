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
import { RouterStore } from 'stores/neutron/router';
import actionConfigs from './actions';

@inject('rootStore')
@observer
export default class SnatRules extends Base {
  init() {
    this.store = new RouterStore();
  }

  get policy() {
    return 'get_router';
  }

  get name() {
    return t('SNAT rules');
  }

  get id() {
    return this.params.id;
  }

  get list() {
    return {
      data: this.store.snats || [],
    };
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getData() {
    const { id } = this.props.match.params;
    this.store.fetchSnats({ id });
  }

  getColumns = () => [
    {
      title: t('Target Subnet'),
      dataIndex: 'src_ip_address',
    },
    {
      // todo: description related to subnet/instance
      title: t('Subnet/Instance'),
      dataIndex: 'description',
      isHideable: true,
    },
    {
      title: t('External Ip Address'),
      dataIndex: 'snat_ip_address',
      isHideable: true,
    },
  ];

  get searchFilters() {
    return [];
  }
}
