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
  imageStatus,
  imageVisibility,
  imageUsage,
  imageFormats,
  transitionStatusList,
  imageContainerFormats,
} from 'resources/glance/image';
import { ImageStore } from 'stores/glance/image';
import { getOptions } from 'utils/index';
import actionConfigs from './actions';

export class Image extends Base {
  init() {
    this.store = new ImageStore();
    this.downloadStore = new ImageStore();
  }

  get policy() {
    return 'get_images';
  }

  get name() {
    return t('images');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get transitionStatusList() {
    return transitionStatusList;
  }

  get isFilterByBackend() {
    return false;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'created_at';
  }

  get hasTab() {
    return !this.isAdminPage;
  }

  updateFetchParams = (params) => {
    if (this.isAdminPage) {
      return {
        ...params,
        all_projects: true,
      };
    }
    switch (this.tab) {
      case 'public':
        return {
          ...params,
          visibility: 'public',
        };
      case 'shared':
        return {
          ...params,
          visibility: 'shared',
        };
      case 'project':
        return {
          ...params,
          owner: this.currentProjectId,
        };
      case 'all':
        return {
          ...params,
          all_projects: true,
        };
      default:
        break;
    }
  };

  get tab() {
    if (this.isAdminPage) {
      return null;
    }
    const { tab = 'project' } = this.props;
    return tab;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get projectFilterKey() {
    return 'owner';
  }

  getColumns() {
    return [
      {
        title: t('ID/Name'),
        dataIndex: 'name',
        routeName: this.getRouteName('imageDetail'),
      },
      {
        title: t('Project ID/Name'),
        dataIndex: 'project_name',
        hidden: !this.isAdminPage && this.tab !== 'all',
        sorter: false,
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        isHideable: true,
        sorter: false,
      },
      {
        title: t('Use Type'),
        dataIndex: 'usage_type',
        isHideable: true,
        valueMap: imageUsage,
        sorter: false,
      },
      {
        title: t('Container Format'),
        dataIndex: 'container_format',
        valueMap: imageContainerFormats,
        isHideable: true,
      },
      {
        title: t('Type'),
        dataIndex: 'os_distro',
        isHideable: true,
        render: (value) => <ImageType type={value} title={value} />,
        width: 80,
        sorter: false,
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: imageStatus,
      },
      {
        title: t('Visibility'),
        dataIndex: 'visibility',
        valueMap: imageVisibility,
        sorter: false,
      },
      {
        title: t('Disk Format'),
        dataIndex: 'disk_format',
        isHideable: true,
        valueMap: imageFormats,
      },
      {
        title: t('Size'),
        dataIndex: 'size',
        isHideable: true,
        valueRender: 'formatSize',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        isHideable: true,
        valueRender: 'sinceTime',
      },
    ];
  }

  get searchFilters() {
    const filters = [
      {
        label: t('Name'),
        name: 'name',
      },
      {
        label: t('Status'),
        name: 'status',
        options: getOptions(imageStatus),
      },
    ];
    const values = ['public', 'shared'];
    if (values.indexOf(this.tab) < 0) {
      filters.push({
        label: t('Visibility'),
        name: 'visibility',
        options: getOptions(imageVisibility),
      });
    }
    return filters;
  }
}

export default inject('rootStore')(observer(Image));
