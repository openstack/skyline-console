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
import ImageType from 'components/ImageType';
import Base from 'containers/List';
import {
  instanceStatus,
  transitionStatus,
  lockRender,
  instanceStatusFilter,
  isIronicInstance,
} from 'resources/instance';
import globalServerStore, { ServerStore } from 'stores/nova/instance';
import { ServerGroupInstanceStore } from 'stores/skyline/server-group-instance';
import actionConfigs from './actions';

@inject('rootStore')
@observer
export default class Instance extends Base {
  init() {
    if (!this.isInDetailPage) {
      this.store = globalServerStore;
    } else if (this.isInServerGroupDetailPage) {
      this.store = new ServerGroupInstanceStore();
    } else {
      this.store = new ServerStore();
    }
    this.downloadStore = new ServerStore();
  }

  get tabs() {
    return [];
  }

  get policy() {
    if (this.isAdminPage) {
      return 'os_compute_api:servers:index:get_all_tenants';
    }
    return 'os_compute_api:servers:index';
  }

  get name() {
    return t('instances');
  }

  get isInServerGroupDetailPage() {
    if (!this.isInDetailPage) {
      return false;
    }
    const {
      match: { path },
    } = this.props;
    return path.indexOf('server-group') >= 0;
  }

  get isInHostDetailPage() {
    if (!this.isInDetailPage) {
      return false;
    }
    const {
      match: { path },
    } = this.props;
    return path.indexOf('hypervisors') >= 0;
  }

  get isInFlavorDetailPage() {
    if (!this.isInDetailPage) {
      return false;
    }
    const {
      match: { path },
    } = this.props;
    return path.indexOf('flavor') >= 0;
  }

  get isFilterByBackend() {
    return !this.isInServerGroupDetailPage;
  }

  get isSortByBackend() {
    return this.isFilterByBackend;
  }

  get transitionStatusList() {
    return Object.keys(transitionStatus);
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get defaultSortKey() {
    return 'created_at';
  }

  get batchActions() {
    const { selectedRowKeys = [], data = [] } = this.store.list;
    const slectedRows = selectedRowKeys.map((key) => {
      return data.find((it) => it.id === key);
    });
    const allIronic = slectedRows.every((it) => isIronicInstance(it));
    const noIronic = slectedRows.every((it) => !isIronicInstance(it));
    if (allIronic) {
      return actionConfigs.batchActionsForIronic;
    }
    if (noIronic) {
      return actionConfigs.batchActions;
    }
    return actionConfigs.batchActionsForOthers;
  }

  getCheckboxProps(record) {
    return {
      name: record.name,
    };
  }

  getColumns = () => {
    const columns = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        linkPrefix: `/compute/${this.getUrl('instance')}/detail`,
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
        title: t('Host'),
        dataIndex: 'host',
        isHideable: true,
        hidden: !this.isAdminPage,
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
        width: 80,
      },
      {
        title: t('Fixed IP'),
        dataIndex: 'fixed_addresses',
        sorter: false,
        isHideable: true,
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
            <div key={it}>
              {it}
              <br />
            </div>
          ));
        },
        stringify: (addresses) => addresses.join(',') || '-',
      },
      {
        title: t('Flavor'),
        dataIndex: 'flavor',
        sorter: false,
        isHideable: true,
        render: (value, record) =>
          isIronicInstance(record)
            ? `${value}(${t('Ironic Instance')})`
            : value,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        sorter: false,
        render: (value) => instanceStatus[value && value.toLowerCase()] || '-',
      },
      {
        title: t('Locked'),
        dataIndex: 'locked',
        isHideable: true,
        render: lockRender,
        width: 80,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        isHideable: true,
        valueRender: 'sinceTime',
      },
    ];
    if (this.isInFlavorDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'flavor');
    }
    if (this.isInHostDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'host');
    }
    return columns;
  };

  get actionConfigs() {
    const { batchActions } = this;
    if (this.isAdminPage) {
      return {
        ...actionConfigs.adminActions,
        batchActions,
      };
    }
    if (this.isInFlavorDetailPage) {
      return {
        ...actionConfigs.actionConfigs,
        primaryActions: [],
        batchActions,
      };
    }
    return {
      ...actionConfigs.actionConfigs,
      batchActions,
    };
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
      ...(this.isAdminPage && !this.isInHostDetailPage
        ? [
            {
              label: t('Host'),
              name: 'host',
            },
          ]
        : []),
      instanceStatusFilter,
    ];
  }

  updateFetchParamsByPage = (params) => {
    const { id, ...rest } = params;
    const newParams = { ...rest };
    if (this.isInHostDetailPage) {
      const { detail: { service: { host } = {} } = {} } = this.props;
      newParams.host = host;
    }
    if (this.isInFlavorDetailPage) {
      const { detail: { id: flavor } = {} } = this.props;
      newParams.flavor_id = flavor;
    }
    return newParams;
  };

  updateFetchParams = (params) => {
    const { detail = {} } = this.props;
    const { members } = detail;
    const { id, ...rest } = params;
    const newParams = { ...rest };
    if (this.isInServerGroupDetailPage) {
      newParams.members = members;
      newParams.isServerGroup = true;
    }
    return newParams;
  };
}
