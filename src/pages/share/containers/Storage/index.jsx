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
import { Storage as Base } from 'pages/storage/containers/Storage';
import globalPoolStore from 'stores/manila/pool';
import { poolColumns } from 'resources/cinder/cinder-pool';

export class Storage extends Base {
  init() {
    this.store = globalPoolStore;
  }

  get policy() {
    return 'scheduler_stats:pools:detail';
  }

  getColumns = () => {
    const columns = [...poolColumns];
    columns[2].dataIndex = 'share_backend_name';
    return columns;
  };

  get searchFilters() {
    const filters = super.searchFilters;
    return filters.slice(0, 2).concat({
      label: t('Backend Name'),
      name: 'share_backend_name',
    });
  }
}

export default inject('rootStore')(observer(Storage));
