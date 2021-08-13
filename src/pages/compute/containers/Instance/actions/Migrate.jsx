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
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import { isActive, isNotDeleting, isIronicInstance } from 'resources/instance';
import globalHypervisorStore from 'stores/nova/hypervisor';
import globalComputeHostStore from 'stores/nova/compute-host';
import { hypervisorColumns, hypervisorFilters } from 'resources/hypervisor';

@inject('rootStore')
@observer
export default class LiveMigrate extends ModalAction {
  static id = 'migrate';

  static title = t('Migrate');

  init() {
    this.store = globalServerStore;
    this.hypervisorStore = globalHypervisorStore;
    this.getHypervisors();
    this.getComputeHosts();
  }

  get name() {
    return t('migrate');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  getHypervisors() {
    this.hypervisorStore.fetchList();
  }

  get hypervisors() {
    return (this.hypervisorStore.list.data || [])
      .filter((it) => {
        return it.hypervisor_type !== 'ironic';
      })
      .map((it) => {
        const computeHost = this.computeHosts.find(
          (host) => host.host === it.hypervisor_hostname
        );
        return {
          ...it,
          key: it.id,
          name: it.hypervisor_hostname,
          computeHost,
        };
      });
  }

  getComputeHosts() {
    globalComputeHostStore.fetchList({ binary: 'nova-compute' });
  }

  get computeHosts() {
    return globalComputeHostStore.list.data || [];
  }

  get tips() {
    return t(
      'Choose a host to migrate instance to. If not selected, the scheduler will auto select target host.'
    );
  }

  get defaultValue() {
    const { name, host } = this.item;
    const value = {
      instance: name,
      current: host,
    };
    return value;
  }

  static policy = 'os_compute_api:os-migrate-server:migrate';

  static allowed = (item) =>
    Promise.resolve(
      isActive(item) && isNotDeleting(item) && !isIronicInstance(item)
    );

  get formItems() {
    const { host } = this.item;
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'current',
        label: t('Current Compute Host'),
        type: 'label',
        iconType: 'aggregate',
      },
      {
        name: 'host',
        label: t('Target Compute Host'),
        type: 'select-table',
        data: this.hypervisors,
        isLoading:
          this.hypervisorStore.list.isLoading &&
          globalComputeHostStore.list.isLoading,
        isMulti: false,
        extra: t(
          'If nova-compute on the host is disabled, it will be forbidden to be selected as the target host.'
        ),
        filterParams: hypervisorFilters,
        columns: hypervisorColumns,
        disabledFunc: (record) =>
          record.name === host ||
          (record.computeHost && record.computeHost.status === 'disabled'),
      },
    ];
  }

  onSubmit = (values) => {
    const { host: { selectedRows = [] } = {} } = values;
    const { id } = this.item;
    let body = null;
    if (selectedRows.length > 0) {
      body = {
        host: selectedRows[0].name,
      };
    }
    return this.store.migrate({ id, body });
  };
}
