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
import { NetworkStore } from 'stores/neutron/network';
import globalNeutronAgentNetworkStore from 'stores/neutron/agent-network';
import { ModalAction } from 'containers/Action';
import { networkColumns, networkSortProps } from 'resources/neutron/network';
import { yesNoOptions } from 'utils/constants';
import { projectRender } from 'utils/table';

export class AddNetwork extends ModalAction {
  static id = 'add-network';

  static title = t('Add Network');

  init() {
    this.store = globalNeutronAgentNetworkStore;
    this.networkStore = new NetworkStore();
    this.getDhcpNetworks();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('add network');
  }

  get instanceName() {
    const { network: { selectedRows = [] } = {} } = this.values;
    return selectedRows.map((it) => it.name).join(', ');
  }

  get detail() {
    const { detail = {} } = this.containerProps;
    return detail;
  }

  get agentId() {
    return this.detail.id;
  }

  async getDhcpNetworks() {
    const { agentId } = this;
    if (!agentId) {
      return;
    }
    await this.store.fetchList({ agentId, all_projects: true });
    this.updateDefaultValue();
  }

  get dhcpNetworks() {
    return (this.store.list.data || []).map((it) => it.id);
  }

  static policy = 'create_dhcp-network';

  static allowed = () => Promise.resolve(true);

  disabledFunc = (record) => {
    const { id } = record;
    return this.dhcpNetworks.includes(id);
  };

  get defaultValue() {
    const { binary } = this.detail;
    return {
      binary,
    };
  }

  getColumns = () => {
    const columns = networkColumns(this);
    columns.splice(1, 0, {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      render: projectRender,
      sortKey: 'project_id',
    });
    return columns;
  };

  getSearchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Shared'),
        name: 'shared',
        options: yesNoOptions,
      },
      {
        label: t('External'),
        name: 'router:external',
        options: yesNoOptions,
      },
      {
        label: t('Project ID'),
        name: 'project_id',
      },
    ];
  }

  get formItems() {
    return [
      {
        name: 'binary',
        label: t('Name'),
        type: 'label',
        iconType: 'host',
      },
      {
        name: 'network',
        label: t('Network'),
        type: 'select-table',
        backendPageStore: this.networkStore,
        disabledFunc: this.disabledFunc,
        extraParams: { all_projects: true },
        required: true,
        isMulti: true,
        filterParams: this.getSearchFilters(),
        columns: this.getColumns(),
        ...networkSortProps,
      },
    ];
  }

  onSubmit = (values) => {
    const { network: { selectedRowKeys = [] } = {} } = values;
    const data = selectedRowKeys.map((it) => ({
      network_id: it,
    }));
    const { agentId } = this;
    return this.store.add({ agentId }, data);
  };
}

export default inject('rootStore')(observer(AddNetwork));
