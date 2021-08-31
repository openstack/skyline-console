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
import { QoSPolicyStore } from 'stores/neutron/qos-policy';
import { qosPolicyColumns, qosPolicyFilters } from 'resources/qos-policy';
import actionConfigs from './actions';

export class QoSPolicy extends Base {
  init() {
    this.store = new QoSPolicyStore();
    this.downloadStore = new QoSPolicyStore();
  }

  get fetchDataByCurrentProject() {
    // add project_id to fetch data;
    return true;
  }

  get policy() {
    return 'get_policy';
  }

  get name() {
    return t('QoS policies');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigs;
    }
    return actionConfigs.consoleActions;
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'name';
  }

  getColumns = () => {
    const ret = [...qosPolicyColumns];
    ret[0].linkPrefix = `/network/${this.getUrl('qos-policy')}/detail`;
    this.isAdminPage &&
      ret.splice(2, 0, {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        sortKey: 'project_id',
      });
    return ret;
  };

  get searchFilters() {
    const filters = [...qosPolicyFilters];
    this.isAdminPage &&
      filters.push({
        label: t('Project ID'),
        name: 'tenant_id',
      });
    return filters;
  }
}

export default inject('rootStore')(observer(QoSPolicy));
