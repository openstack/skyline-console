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
import globalRouterStore, { RouterStore } from 'stores/neutron/router';
import actionConfigs from './actions';

export class Routes extends Base {
  init() {
    this.store = this.inDetailPage ? new RouterStore() : globalRouterStore;
    this.downloadStore = new RouterStore();
  }

  get policy() {
    return 'get_router';
  }

  get name() {
    return t('routers');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.adminConfigs
      : actionConfigs.actionConfigs;
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get defaultSortKey() {
    return 'status';
  }

  getColumns = () => getRouterColumns(this);

  get searchFilters() {
    return routerFilters;
  }
}

export default inject('rootStore')(observer(Routes));
