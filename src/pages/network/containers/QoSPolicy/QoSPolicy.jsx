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
import {
  getQosPolicyColumns,
  getQosPolicyFilters,
} from 'resources/neutron/qos-policy';
import { qosEndpoint } from 'client/client/constants';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

export class QoSPolicy extends Base {
  init() {
    this.store = new QoSPolicyStore();
    this.downloadStore = new QoSPolicyStore();
  }

  get isProjectTab() {
    const tab = this.tabKey;
    if (this.isAdminPage) {
      return false;
    }
    return !tab || tab === 'projectQoSPolicy';
  }

  updateFetchParamsByPage = (params) => {
    switch (this.tabKey) {
      case 'projectQoSPolicy':
        return {
          ...params,
          project_id: this.currentProjectId,
        };
      case 'sharedQoSPolicy':
        return {
          ...params,
          shared: true,
        };
      default:
        return params;
    }
  };

  get checkEndpoint() {
    return true;
  }

  get endpoint() {
    return qosEndpoint();
  }

  get policy() {
    return 'get_policy';
  }

  get aliasPolicy() {
    return 'neutron:get_policy';
  }

  get name() {
    return t('QoS policies');
  }

  get actionConfigs() {
    if (this.isAdminPage) {
      return actionConfigs.actionConfigs;
    }
    if (this.isProjectTab) {
      return actionConfigs.consoleActions;
    }
    return emptyActionConfig;
  }

  get hasTab() {
    return !this.isAdminPage;
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

  get tabKey() {
    const { tab } = this.props;
    return tab;
  }

  getColumnParamsFromTabKey() {
    switch (this.tabKey) {
      case 'projectQoSPolicy':
        return {
          self: this,
          all: false,
          shared: false,
        };
      case 'sharedQoSPolicy':
        return {
          self: this,
          all: false,
          shared: true,
        };
      case 'allQoSPolicy':
        return {
          self: this,
          all: true,
          shared: false,
        };
      default:
        return {
          self: this,
          all: true,
          shared: false,
        };
    }
  }

  getColumns() {
    return getQosPolicyColumns(this.getColumnParamsFromTabKey());
  }

  get searchFilters() {
    return getQosPolicyFilters(this.getColumnParamsFromTabKey());
  }
}

export default inject('rootStore')(observer(QoSPolicy));
