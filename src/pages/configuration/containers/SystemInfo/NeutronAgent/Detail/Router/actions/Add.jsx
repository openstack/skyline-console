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
import { RouterStore } from 'stores/neutron/router';
import globalNeutronAgentRouterStore from 'stores/neutron/agent-router';
import { ModalAction } from 'containers/Action';
import {
  getRouterColumns,
  routerFilters,
  routerSortProps,
} from 'resources/neutron/router';
import { projectRender } from 'utils/table';

export class AddRouter extends ModalAction {
  static id = 'add-router';

  static title = t('Add Router');

  init() {
    this.store = globalNeutronAgentRouterStore;
    this.routerStore = new RouterStore();
    this.getL3Routes();
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('add router');
  }

  get instanceName() {
    const { router: { selectedRows = [] } = {} } = this.values;
    return selectedRows.map((it) => it.name).join(', ');
  }

  get detail() {
    const { detail = {} } = this.containerProps;
    return detail;
  }

  get agentId() {
    return this.detail.id;
  }

  async getL3Routes() {
    const { agentId } = this;
    if (!agentId) {
      return;
    }
    await this.store.fetchList({ agentId, all_projects: true });
    this.updateDefaultValue();
  }

  get l3Routes() {
    return (this.store.list.data || []).map((it) => it.id);
  }

  static policy = 'create_l3-router';

  static allowed = () => Promise.resolve(true);

  disabledFunc = (record) => {
    const { id } = record;
    return this.l3Routes.indexOf(id) >= 0;
  };

  get defaultValue() {
    const { binary } = this.detail;
    return {
      binary,
    };
  }

  getColumns() {
    const columns = getRouterColumns(this);
    columns[0].render = null;
    columns[1].render = projectRender;
    return columns;
  }

  getFilters() {
    return [
      ...routerFilters,
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
        name: 'router',
        label: t('Router'),
        type: 'select-table',
        backendPageStore: this.routerStore,
        disabledFunc: this.disabledFunc,
        extraParams: { all_projects: true },
        required: true,
        isMulti: true,
        filterParams: this.getFilters(),
        columns: this.getColumns(),
        ...routerSortProps,
      },
    ];
  }

  onSubmit = (values) => {
    const { router: { selectedRowKeys = [] } = {} } = values;
    const data = selectedRowKeys.map((it) => ({
      router_id: it,
    }));
    const { agentId } = this;
    return this.store.add({ agentId }, data);
  };
}

export default inject('rootStore')(observer(AddRouter));
