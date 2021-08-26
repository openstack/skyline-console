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
import { volumeStatus, snapshotTransitionStatuses } from 'resources/volume';
import globalSnapshotStore, { SnapshotStore } from 'stores/cinder/snapshot';
import actionConfigs from './actions';

@inject('rootStore')
@observer
export default class Snapshots extends Base {
  init() {
    if (this.isInDetailPage) {
      this.store = new SnapshotStore();
      this.downloadStore = this.store;
    } else {
      this.store = globalSnapshotStore;
      this.downloadStore = new SnapshotStore();
    }
    this.downloadStore = new SnapshotStore();
  }

  get policy() {
    return 'volume:get_all_snapshots';
  }

  get name() {
    return t('volume snapshots');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.adminConfigs
      : actionConfigs.actionConfigs;
  }

  get transitionStatusList() {
    return snapshotTransitionStatuses;
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
    return 'created_at';
  }

  updateFetchParamsByPage = (params) => {
    const { tab, id, ...rest } = params;
    if (this.isInDetailPage) {
      return {
        ...rest,
        volume_id: id,
      };
    }
    return rest;
  };

  shouldRefreshDetail() {
    return false;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      linkPrefix: `/storage/${this.getUrl('snapshot')}/detail`,
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      hidden: !this.isAdminPage,
      sorter: false,
    },
    {
      title: t('Host'),
      dataIndex: 'host',
      isHideable: true,
      valueRender: 'noValue',
      hidden: !this.isAdminPage,
      sorter: false,
    },
    {
      title: t('Size'),
      dataIndex: 'size',
      isHideable: true,
      render: (data) => `${data} GB`,
      sorter: false,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      render: (value) => volumeStatus[value] || '-',
    },
    {
      title: t('Volume ID/Name'),
      dataIndex: 'volume_name',
      isName: true,
      idKey: 'volume_id',
      linkFunc: (_, record) =>
        `${this.getUrl('/storage/volume')}/detail/${
          record.volume_id
        }?tab=snapshot`,
      isHideable: true,
      sorter: false,
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
      {
        label: t('Status'),
        name: 'status',
        options: [
          { label: t('Available'), key: 'AVAILABLE' },
          { label: t('Error'), key: 'ERROR' },
        ],
      },
    ];
  }
}
