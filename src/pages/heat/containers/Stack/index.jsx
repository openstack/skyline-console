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
import globalStackStore, { StackStore } from 'stores/heat/stack';
import { stackStatus } from 'resources/heat/stack';
import actionConfigs from './actions';

export class Stack extends Base {
  init() {
    this.store = globalStackStore;
    this.downloadStore = new StackStore();
  }

  get policy() {
    if (this.isAdminPage) {
      return 'stacks:global_index';
    }
    return 'stacks:index';
  }

  get name() {
    return t('stacks');
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'creation_time';
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get projectFilterKey() {
    return 'tenant';
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'stack_name',
      routeName: this.getRouteName('stackDetail'),
      routeParamsFunc: (data) => {
        return {
          id: data.id,
          name: data.stack_name,
        };
      },
      isLink: true,
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !this.isAdminPage,
      sorter: false,
    },
    {
      title: t('Stack Status'),
      dataIndex: 'stack_status',
      isHideable: true,
      valueMap: stackStatus,
    },
    {
      title: t('Created At'),
      dataIndex: 'creation_time',
      isHideable: true,
      valueRender: 'sinceTime',
    },
    {
      title: t('Updated At'),
      dataIndex: 'updated_time',
      isHideable: true,
      valueRender: 'sinceTime',
    },
  ];

  get actionConfigs() {
    return actionConfigs;
  }

  get searchFilters() {
    const statuses = [
      'CREATE_COMPLETE',
      'CREATE_FAILED',
      'ROLLBACK_COMPLETE',
      'ROLLBACK_FAILED',
      'UPDATE_COMPLETE',
      'UPDATE_FAILED',
      'DELETE_COMPLETE',
      'DELETE_FAILED',
    ];
    const options = statuses.map((status) => ({
      key: status,
      label: stackStatus[status],
    }));
    return [
      {
        label: t('ID'),
        name: 'id',
      },
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Stack Status'),
        name: 'status',
        options,
      },
    ];
  }
}

export default inject('rootStore')(observer(Stack));
