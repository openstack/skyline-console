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
import globalPoolStore from 'stores/cinder/pool';
import { poolColumns } from 'resources/cinder/cinder-pool';

export class Storage extends Base {
  init() {
    this.store = globalPoolStore;
  }

  get policy() {
    return 'scheduler_extension:scheduler_stats:get_pools';
  }

  get name() {
    return t('storage backend');
  }

  get rowKey() {
    return 'name';
  }

  getColumns = () => poolColumns;

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Protocol'),
        name: 'storage_protocol',
      },
      {
        label: t('Backend Name'),
        name: 'volume_backend_name',
      },
    ];
  }

  updateFetchParams = (params) => {
    const { all_projects, ...rest } = params;
    return rest;
  };
}

export default inject('rootStore')(observer(Storage));
