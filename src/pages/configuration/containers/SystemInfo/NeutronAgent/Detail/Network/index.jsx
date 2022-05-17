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
import { networkColumns } from 'resources/neutron/network';
import { NeutronAgentNetworkStore } from 'stores/neutron/agent-network';
import { yesNoOptions } from 'utils/constants';
import actionConfigs from './actions';

export class Networks extends Base {
  init() {
    this.store = new NeutronAgentNetworkStore();
  }

  get policy() {
    return 'get_dhcp-networks';
  }

  get name() {
    return t('networks');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => {
    const columns = networkColumns(this);
    columns.splice(1, 0, {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
    });
    return columns;
  };

  get adminPageHasProjectFilter() {
    return true;
  }

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

  updateFetchParams = (params) => {
    const { id, ...rest } = params;
    return {
      agentId: id,
      ...rest,
    };
  };
}

export default inject('rootStore')(observer(Networks));
