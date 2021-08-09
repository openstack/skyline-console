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
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import {
  volumeStatus,
  diskTag,
  volumeTransitionStatuses,
  bootableType,
  volumeFilters,
  multiTip,
} from 'resources/volume';
import globalVolumeStore, { VolumeStore } from 'stores/cinder/volume';
import { InstanceVolumeStore } from 'stores/nova/instance-volume';
import { toLocalTimeFilter } from 'utils/index';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

@inject('rootStore')
@observer
export default class Volume extends Base {
  init() {
    if (this.inDetailPage) {
      this.store = new InstanceVolumeStore();
      this.downloadStore = this.store;
    } else {
      this.store = globalVolumeStore;
      this.downloadStore = new VolumeStore();
    }
  }

  get policy() {
    return 'volume:get_all';
  }

  get name() {
    return t('volumes');
  }

  get isRecycleBinDetail() {
    const { pathname } = this.props.location;
    return pathname.indexOf('recycle-bin') >= 0;
  }

  get actionConfigs() {
    if (this.isRecycleBinDetail) {
      return emptyActionConfig;
    }
    if (this.isAdminPage) {
      return this.inDetailPage
        ? actionConfigs.instanceDetailAdminConfig
        : actionConfigs.adminConfig;
    }
    return this.inDetailPage
      ? actionConfigs.instanceDetailConfig
      : actionConfigs.actionConfigs;
  }

  get transitionStatusList() {
    return volumeTransitionStatuses;
  }

  get isFilterByBackend() {
    return !this.inDetailPage;
  }

  get isSortByBackend() {
    return this.isFilterByBackend;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get defaultSortKey() {
    return 'created_at';
  }

  getColumns = () => {
    const columns = [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        linkPrefix: `/storage/${this.getUrl('volume')}/detail`,
        stringify: (name, record) => name || record.id,
        sortKey: 'name',
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage,
        isHideable: true,
        sorter: false,
      },
      {
        title: t('Host'),
        dataIndex: 'host',
        isHideable: true,
        hidden: !this.isAdminPage,
        sorter: false,
      },
      {
        title: t('Size'),
        dataIndex: 'size',
        isHideable: true,
        render: (value) => `${value}GB`,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        render: (value) => volumeStatus[value] || '-',
      },
      {
        title: t('Type'),
        dataIndex: 'volume_type',
        isHideable: true,
        width: 100,
        sorter: false,
      },
      {
        title: t('Disk Tag'),
        dataIndex: 'disk_tag',
        isHideable: true,
        render: (value) => diskTag[value] || '-',
        sorter: false,
      },
      {
        title: t('Attached To'),
        dataIndex: 'attachments',
        isHideable: true,
        sorter: false,
        render: (value) => {
          if (value && value.length > 0) {
            return value.map((it) => (
              <div key={it.server_id}>
                {it.device} on{' '}
                <Link
                  to={`${this.getUrl('/compute/instance')}/detail/${
                    it.server_id
                  }?tab=volumes`}
                >
                  {it.server_name}
                </Link>
              </div>
            ));
          }
          return '-';
        },
        stringify: (value) => {
          if (value && value.length) {
            return value
              .map((it) => `${it.server_name}(${it.server_id})`)
              .join(',');
          }
          return '-';
        },
      },
      {
        title: t('Bootable'),
        titleTip: t(
          'When the volume is "bootable" and the status is "available", it can be used as a startup source to create an instance.'
        ),
        dataIndex: 'bootable',
        isHideable: true,
        render: (value) => bootableType[value] || '-',
      },
      {
        title: t('Shared'),
        dataIndex: 'multiattach',
        valueRender: 'yesNo',
        titleTip: multiTip,
        width: 80,
        sorter: false,
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        isHideable: true,
        valueRender: 'sinceTime',
        stringify: (value) => toLocalTimeFilter(value),
      },
    ];
    if (this.inDetailPage) {
      return columns.filter((it) => it.dataIndex !== 'attachments');
    }
    return columns;
  };

  get searchFilters() {
    return volumeFilters;
  }

  updateFetchParams = (params) => {
    if (this.inDetailPage) {
      const { match, detail } = this.props;
      const { id } = match.params;
      const { tenant_id: projectId, name } = detail || {};
      return {
        ...params,
        serverId: id,
        serverName: name,
        projectId,
      };
    }
    return params;
  };
}
