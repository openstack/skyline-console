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
import globalShareStore, { ShareStore } from 'stores/manila/share';
import { shareStatus, shareProtocol } from 'resources/manila/share';
import actionConfigs from './actions';

export class Share extends Base {
  init() {
    this.store = globalShareStore;
    this.downloadStore = new ShareStore();
  }

  get policy() {
    return 'manila:share:get_all';
  }

  get name() {
    return t('share');
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
      routeName: this.getRouteName('shareDetail'),
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
      isHideable: true,
    },
    {
      title: t('Availability Zone'),
      dataIndex: 'availability_zone',
    },
    {
      title: t('Share Type'),
      dataIndex: 'share_type_name',
      render: (value, record) => value || record.share_type,
    },
    {
      title: t('Size'),
      dataIndex: 'size',
      render: (value) => `${value}GiB`,
    },
    {
      title: t('Protocol'),
      dataIndex: 'share_proto',
      render: (value) => shareProtocol[value] || value,
    },
    {
      title: t('Public'),
      dataIndex: 'is_public',
      isHideable: true,
      valueRender: 'yesNo',
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      render: (value) => shareStatus[value] || value,
    },
    {
      title: t('Share Network'),
      dataIndex: 'share_network_id',
      isHideable: true,
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
      title: t('Share Group'),
      dataIndex: 'share_group_id',
      isHideable: true,
      render: (value) => {
        if (!value) {
          return '-';
        }
        const link = this.getLinkRender('shareGroupDetail', value, {
          id: value,
        });
        return link;
      },
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

export default inject('rootStore')(observer(Share));
