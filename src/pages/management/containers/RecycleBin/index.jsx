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

import React from 'react';
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalRecycleBinStore, {
  RecycleBinStore,
} from 'stores/skyline/recycle-server';
import ImageType from 'components/ImageType';
import actionConfigs from './actions';

export class RecycleBin extends Base {
  init() {
    this.store = globalRecycleBinStore;
    this.downloadStore = new RecycleBinStore();
  }

  get policy() {
    if (this.isAdminPage) {
      return 'os_compute_api:servers:index:get_all_tenants';
    }
    return 'os_compute_api:servers:index';
  }

  get name() {
    return t('recycle bins');
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'updated_at';
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'name',
      routeName: this.getRouteName('recycleBinDetail'),
      sortKey: 'display_name',
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
      hidden: !this.isAdminPage,
      sortKey: 'project_id',
    },
    {
      title: t('Image'),
      dataIndex: 'image_os_distro',
      isHideable: true,
      render: (value, record) => (
        <ImageType type={value} title={record.image_name} />
      ),
      stringify: (_, record) => record.image_name,
      sorter: false,
    },
    {
      title: t('Fixed IP'),
      dataIndex: 'fixed_addresses',
      isHideable: true,
      sorter: false,
      render: (fixed_addresses) => {
        if (!fixed_addresses.length) {
          return '-';
        }
        return fixed_addresses.map((it) => <div key={it}>{it}</div>);
      },
      stringify: (value) => value.join(',') || '-',
    },
    {
      title: t('Floating IP'),
      dataIndex: 'floating_addresses',
      isHideable: true,
      sorter: false,
      render: (addresses) => {
        if (!addresses.length) {
          return '-';
        }
        return addresses.map((it) => (
          <span key={it}>
            {it}
            <br />
          </span>
        ));
      },
      stringify: (value) => value.join(',') || '-',
    },
    {
      title: t('Flavor'),
      dataIndex: 'flavor',
      isHideable: true,
      sorter: false,
    },
    {
      title: t('Deleted At'),
      dataIndex: 'deleted_at',
      isHideable: true,
      valueRender: 'sinceTime',
      sortKey: 'updated_at',
    },
    {
      title: t('Expired Time'),
      dataIndex: 'reclaim_timestamp',
      isHideable: true,
      valueRender: 'toLocalTime',
      sorter: false,
    },
  ];

  get actionConfigs() {
    return actionConfigs;
  }

  get searchFilters() {
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      ...(this.isAdminPage
        ? [
            {
              label: t('Project Name'),
              name: 'project_name',
            },
          ]
        : []),
    ];
  }
}

export default inject('rootStore')(observer(RecycleBin));
