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
import { getRouterColumns, routerFilters } from 'resources/neutron/router';
import { NeutronAgentRouterStore } from 'stores/neutron/agent-router';
import actionConfigs from './actions';

export class Router extends Base {
  init() {
    this.store = new NeutronAgentRouterStore();
  }

  get policy() {
    return 'get_l3-routers';
  }

  get name() {
    return t('routers');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get isFilterByBackend() {
    return false;
  }

  getColumns = () => getRouterColumns(this);

  get searchFilters() {
    return routerFilters;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  updateFetchParams = (params) => {
    const { id, ...rest } = params;
    return {
      agentId: id,
      ...rest,
    };
  };
}

export default inject('rootStore')(observer(Router));
