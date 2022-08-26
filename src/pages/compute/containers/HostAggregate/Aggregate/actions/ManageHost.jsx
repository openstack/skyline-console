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
import { AggregateStore } from 'stores/nova/aggregate';
import globalComputeHostStore from 'stores/nova/compute-host';
import { ModalAction } from 'containers/Action';
import { serviceStatus, serviceState } from 'resources/nova/service';

export class ManageHost extends ModalAction {
  static id = 'ManageHost';

  static title = t('Manage Host');

  init() {
    this.store = new AggregateStore();
    this.getComputeHosts();
  }

  get name() {
    return t('Manage host');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  static policy = [
    'os_compute_api:os-aggregates:add_host',
    'os_compute_api:os-aggregates:remove_host',
  ];

  static allowed = () => Promise.resolve(true);

  get tips() {
    return t(
      'Add hosts to the aggregate or remove hosts from it. Hosts can be in multiple aggregates.'
    );
  }

  getComputeHosts() {
    globalComputeHostStore.fetchList({ binary: 'nova-compute' });
  }

  get computeHosts() {
    return (globalComputeHostStore.list.data || []).map((it) => ({
      ...it,
      name: it.host,
      id: it.host,
    }));
  }

  get defaultValue() {
    const { name, hosts } = this.item;
    return {
      name,
      hosts: {
        selectedRowKeys: hosts,
      },
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
        iconType: 'aggregate',
      },
      {
        name: 'hosts',
        label: t('Hosts'),
        type: 'select-table',
        isMulti: true,
        data: this.computeHosts,
        isLoading: globalComputeHostStore.list.isLoading,
        filterParams: [
          {
            label: t('Host'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Host'),
            dataIndex: 'host',
          },
          {
            title: t('Availability Zone'),
            dataIndex: 'zone',
          },
          {
            title: t('Admin Status'),
            dataIndex: 'status',
            isHideable: true,
            valueMap: serviceStatus,
            tip: (value, record) => {
              const { disabled_reason } = record || {};
              if (disabled_reason) {
                return `${t('Reason: ')} ${disabled_reason}`;
              }
              return '';
            },
          },
          {
            title: t('State'),
            dataIndex: 'state',
            isHideable: true,
            valueMap: serviceState,
          },
          {
            title: t('Last Updated'),
            dataIndex: 'updated_at',
            valueRender: 'sinceTime',
            isHideable: true,
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { hosts } = values;
    const { selectedRowKeys: newHosts } = hosts;
    const { id, hosts: oldHosts } = this.item;
    const adds = newHosts.filter((it) => oldHosts.indexOf(it) < 0);
    const dels = oldHosts.filter((it) => newHosts.indexOf(it) < 0);
    if (adds.length === 0 && dels.length === 0) {
      return Promise.resolve();
    }
    return this.store.manageHost({ id, adds, dels });
  };
}

export default inject('rootStore')(observer(ManageHost));
