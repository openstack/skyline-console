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
    this.store = this.inDetailPage ? new ShareStore() : globalShareStore;
    this.downloadStore = new ShareStore();
  }

  get policy() {
    return 'share:get_all';
  }

  get name() {
    return t('share');
  }

  get isFilterByBackend() {
    return true;
  }

  get inShareGroupDetailPage() {
    return this.inDetailPage && this.path.includes('share-group');
  }

  get inShareTypeDetailPage() {
    return this.inDetailPage && this.path.includes('share-type');
  }

  get inShareNetworkDetailPage() {
    return this.inDetailPage && this.path.includes('share-network');
  }

  get inShareServerDetailPage() {
    return this.inDetailPage && this.path.includes('share-server');
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'created_at';
  }

  updateFetchParamsByPage = (params) => {
    const { id, ...rest } = params;
    const newParams = { ...rest };
    if (this.inShareGroupDetailPage) {
      newParams.share_group_id = id;
    }
    if (this.inShareTypeDetailPage) {
      newParams.share_type_id = id;
    }
    if (this.inShareNetworkDetailPage) {
      newParams.share_network_id = id;
    }
    if (this.inShareServerDetailPage) {
      newParams.share_server_id = id;
    }
    return newParams;
  };

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  getColumns = () => {
    const columns = [
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
        sortKey: 'project_id',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        isHideable: true,
        sorter: false,
      },
      {
        title: t('Availability Zone'),
        dataIndex: 'availability_zone',
        sorter: false,
      },
      {
        title: t('Share Type'),
        dataIndex: 'share_type_name',
        render: (value, record) => value || record.share_type,
        sortKey: 'share_type_id',
      },
      {
        title: t('Size'),
        dataIndex: 'size',
        unit: 'GiB',
      },
      {
        title: t('Protocol'),
        dataIndex: 'share_proto',
        valueMap: shareProtocol,
      },
      {
        title: t('Public'),
        dataIndex: 'is_public',
        isHideable: true,
        valueRender: 'yesNo',
        sorter: false,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: shareStatus,
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
        // sorter: false,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        isHideable: true,
        valueRender: 'sinceTime',
      },
    ];
    if (this.inShareGroupDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'share_group_id');
    }
    if (this.inShareNetworkDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'share_network_id');
    }
    if (this.inShareTypeDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'share_type_name');
    }
    return columns;
  };

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
