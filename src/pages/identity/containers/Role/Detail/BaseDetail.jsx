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
import globalRoleStore from 'stores/keystone/role';
import Base from 'containers/BaseDetail';
import { toJS } from 'mobx';
import rolePermission from 'resources/keystone/role';

export class BaseDetail extends Base {
  init() {
    this.store = globalRoleStore;
  }

  fetchData = (params) => {
    const { id } = this.props.match.params;
    this.store
      .fetchImpliedRoles({
        id,
        ...params,
      })
      .catch(this.catch);
  };

  get detailData() {
    return toJS(this.store.implyRoles);
  }

  get leftCards() {
    const cards = [this.roleCard];
    return cards;
  }

  get roleCard() {
    const options = [
      {
        label: t('Compute service:'),
        dataIndex: 'nova',
        render: (value) => {
          return rolePermission[value] || '-';
        },
      },
      {
        label: t('Block Storage service:'),
        dataIndex: 'cinder',
        render: (value) => {
          return rolePermission[value] || '-';
        },
      },
      {
        label: t('Networking service:'),
        dataIndex: 'neutron',
        render: (value) => {
          return rolePermission[value] || '-';
        },
      },
      {
        label: t('Image service:'),
        dataIndex: 'glance',
        render: (value) => {
          return rolePermission[value] || '-';
        },
      },
      {
        label: t('Placement service:'),
        dataIndex: 'placement',
        render: (value) => {
          return rolePermission[value] || '-';
        },
      },
      {
        label: t('Orchestration service:'),
        dataIndex: 'heat',
        render: (value) => {
          return rolePermission[value] || '-';
        },
      },
      {
        label: t('Identity service:'),
        dataIndex: 'keystone',
        render: (value) => {
          return rolePermission[value] || '-';
        },
      },
    ];

    return {
      title: t('Resource'),
      options,
      labelCol: 12,
      contentCol: 12,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
