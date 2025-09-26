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
import { reaction } from 'mobx';
import ImageType from 'components/ImageType';
import Base from 'containers/List';
import Notify from 'components/Notify';
import {
  instanceStatus,
  transitionStatus,
  lockRender,
  instanceStatusFilter,
  isIronicInstance,
  SimpleTag,
} from 'resources/nova/instance';
import globalServerStore, { ServerStore } from 'stores/nova/instance';
import { ServerGroupInstanceStore } from 'stores/skyline/server-group-instance';
import actionConfigs from './actions';

export class Instance extends Base {
  notifiedInstances = new Set();

  init() {
    if (!this.inDetailPage) {
      this.store = globalServerStore;
    } else if (this.inServerGroupDetailPage) {
      this.store = new ServerGroupInstanceStore();
    } else {
      this.store = new ServerStore();
    }
    this.downloadStore = new ServerStore();
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

  get inServerGroupDetailPage() {
    if (!this.inDetailPage) {
      return false;
    }
    return this.path.includes('server-group');
  }

  get inHostDetailPage() {
    if (!this.inDetailPage) {
      return false;
    }
    return this.path.includes('hypervisors');
  }

  get inFlavorDetailPage() {
    if (!this.inDetailPage) {
      return false;
    }
    return this.path.includes('flavor');
  }

  get isFilterByBackend() {
    return !this.inServerGroupDetailPage;
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
    const selectedRows = selectedRowKeys.map((key) => {
      return data.find((it) => it.id === key);
    });
    const allIronic = selectedRows.every((it) => isIronicInstance(it));
    const noIronic = selectedRows.every((it) => !isIronicInstance(it));
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

  componentDidMount() {
    super.componentDidMount();

    this.dispose = reaction(
      () => {
        const { data } = this.store.list;
        return data && data.length > 0
          ? data.filter((instance) => instance.status === 'verify_resize')
          : [];
      },
      (verifyResizeInstances) => {
        if (verifyResizeInstances.length === 0) return;
        verifyResizeInstances.forEach((instance) => {
          if (!this.notifiedInstances.has(instance.id)) {
            Notify.warn(
              t(
                `Waiting for user to Confirm/Revert the Resize for\n ${instance.id}`
              )
            );
            this.notifiedInstances.add(instance.id);
          }
        });
      },
      {
        fireImmediately: false,
        delay: 100,
      }
    );
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    if (this.dispose) {
      this.dispose();
    }
    this.notifiedInstances.clear();
  }

  getColumns() {
    const columns = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('instanceDetail'),
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
        title: t('Tags'),
        dataIndex: 'tags',
        render: (tags) => tags.map((tag, index) => SimpleTag({ tag, index })),
        isHideable: true,
        sorter: false,
      },
      {
        title: t('Locked'),
        dataIndex: 'locked',
        isHideable: true,
        render: lockRender,
        width: 80,
        stringify: (value) => (value ? t('Locked') : t('Not locked')),
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        isHideable: true,
        valueRender: 'sinceTime',
      },
    ];
    if (this.inFlavorDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'flavor');
    }
    if (this.inHostDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'host');
    }
    return columns;
  }

  get actionConfigs() {
    const { batchActions } = this;
    if (this.isAdminPage) {
      return {
        ...actionConfigs.adminActions,
        batchActions,
      };
    }
    if (this.inFlavorDetailPage) {
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
    const ipFilter = this.isFilterByBackend
      ? {
          label: t('Fixed IP'),
          name: 'ip',
        }
      : {
          label: t('Fixed IP'),
          name: 'fixed_addresses',
          filterFunc: (val, filterVal) => {
            return (val || []).some((v) =>
              v.includes((filterVal || '').trim())
            );
          },
        };
    return [
      {
        label: t('Name'),
        name: 'name',
      },
      ipFilter,
      ...(this.isAdminPage
        ? [
            {
              label: t('Project Name'),
              name: 'project_name',
            },
            {
              label: t('Project ID'),
              name: 'project_id',
            },
          ]
        : []),
      ...(this.isAdminPage && !this.inHostDetailPage
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
    if (this.inHostDetailPage) {
      const { detail: { service: { host } = {} } = {} } = this.props;
      newParams.host = host;
    }
    if (this.inFlavorDetailPage) {
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
    if (this.inServerGroupDetailPage) {
      newParams.members = members;
      newParams.isServerGroup = true;
    }
    return newParams;
  };
}

export default inject('rootStore')(observer(Instance));
