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
  flavorArchitectures,
  getBaseColumns,
  extraColumns,
  getFlavorSearchFilters,
} from 'resources/nova/flavor';
import actionConfigs from './actions';

export class Flavor extends Base {
  init() {
    this.store = new FlavorStore();
  }

  get policy() {
    return 'os_compute_api:os-flavor-extra-specs:index';
  }

  get name() {
    return `${flavorArchitectures.bare_metal} ${t('Flavors')}`;
  }

  get hasTab() {
    return true;
  }

  getColumns = () => {
    const columns = [...getBaseColumns(this), ...extraColumns];
    const removes = [
      'quota:vif_outbound_average',
      'OS-FLV-EXT-DATA:ephemeral',
      'quota:disk_total_iops_sec',
    ];
    return columns.filter((it) => removes.indexOf(it.dataIndex) < 0);
  };

  get actionConfigs() {
    return this.isAdminPage ? actionConfigs : emptyActionConfig;
  }

  updateFetchParams = (params) => ({
    ...params,
    tab: 'bare_metal',
  });

  get searchFilters() {
    return getFlavorSearchFilters();
  }
}

export default inject('rootStore')(observer(Flavor));
