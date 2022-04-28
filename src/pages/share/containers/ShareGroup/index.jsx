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
import globalShareGroupStore, {
  ShareGroupStore,
} from 'stores/manila/share-group';
import { shareGroupStatus } from 'resources/manila/share-group';
import actionConfigs from './actions';

export class ShareGroup extends Base {
  init() {
    this.store = globalShareGroupStore;
    this.downloadStore = new ShareGroupStore();
  }

  get policy() {
    return 'manila:share_group:get_all';
  }

  get name() {
    return t('share groups');
  }

  get isFilterByBackend() {
    return true;
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('shareGroupDetail'),
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !this.isAdminPage,
    },
    {
      title: t('Description'),
      dataIndex: 'description',
    },
    {
      title: t('Availability Zone'),
      dataIndex: 'availability_zone',
    },
    {
      title: t('Share Network'),
      dataIndex: 'share_network_id',
      render: (value) => {
        if (!value) {
          return '-';
        }
        const link = this.getLinkRender('shareNetworkDetail', value, {
          id: value,
        });
        return link;
      },
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      render: (value) => shareGroupStatus[value] || value,
    },
    {
      title: t('Created At'),
      dataIndex: 'created_at',
      isHideable: true,
      valueRender: 'sinceTime',
    },
  ];

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
    ];
  }
}

export default inject('rootStore')(observer(ShareGroup));
