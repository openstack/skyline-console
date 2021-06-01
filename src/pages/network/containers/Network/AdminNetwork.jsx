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
import { networkColumns } from 'resources/network';
import { NetworkStore } from 'stores/neutron/network';
import { yesNoOptions } from 'utils/constants';
import actionConfigs from './actions';

@inject('rootStore')
@observer
export default class Networks extends Base {
  init() {
    this.store = new NetworkStore();
    this.downloadStore = new NetworkStore();
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'status';
  }

  get policy() {
    return 'get_network';
  }

  get name() {
    return t('networks');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get hasTab() {
    return !this.isAdminPage;
  }

  get adminPageHasProjectFilter() {
    return true;
  }
  // renderSubnetDetails(value) {
  //   return value.length === 0 ? '-' : value.map((it, index) => <div key={`network_subnet_detail${index}`}><b>{it.name}</b>:<br />{it.cidr}</div>);
  // }

  updateFetchParamsByPage = (params) => ({
    ...params,
    all_projects: true,
  });

  getColumns = () => {
    const columns = networkColumns(this);
    columns.splice(1, 0, {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      sortKey: 'project_id',
    });
    return columns;
  };

  get searchFilters() {
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
    ];
  }
}
