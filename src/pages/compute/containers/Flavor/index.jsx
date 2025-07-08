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
import { FlavorStore } from 'stores/nova/flavor';
import { emptyActionConfig } from 'utils/constants';
import {
  getBaseColumns,
  extraColumns,
  getFlavorSearchFilters,
  x86CategoryList,
} from 'resources/nova/flavor';
import actionConfigs from './Other/actions';

export class Flavor extends Base {
  init() {
    this.store = new FlavorStore();
  }

  get policy() {
    return 'os_compute_api:os-flavor-extra-specs:index';
  }

  get name() {
    return `${t('Custom')} ${t('Flavors')}`;
  }

  get hasTab() {
    return true;
  }

  getColumns = () => {
    const newBaseColumns = [...getBaseColumns(this)];
    newBaseColumns.splice(1, 1);
    return [...newBaseColumns, ...extraColumns];
  };

  updateFetchParams = (params) => ({
    ...params,
    tabs: ['x86_architecture', 'custom'],
  });

  get actionConfigs() {
    return this.isAdminPage ? actionConfigs : emptyActionConfig;
  }

  get searchFilters() {
    return getFlavorSearchFilters(x86CategoryList);
  }
}

export default inject('rootStore')(observer(Flavor));
