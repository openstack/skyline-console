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

import { inject, observer } from 'mobx-react';
import { imageStatus } from 'resources/image';
import { ImageStore } from 'stores/glance/image';
import Base from 'containers/TabDetail';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class ImageDetail extends Base {
  get name() {
    return this.isImageDetail ? t('image') : t('instance snapshot');
  }

  get policy() {
    return 'get_image';
  }

  get isImageDetail() {
    const { pathname } = this.props.location;
    return pathname.indexOf('image') >= 0;
  }

  get listUrl() {
    return this.getRoutePath('image');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        render: (data) => imageStatus[data] || '-',
      },
      {
        title: t('Project ID'),
        dataIndex: 'owner',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
      {
        title: t('Updated At'),
        dataIndex: 'updated_at',
        valueRender: 'toLocalTime',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('BaseDetail'),
        key: 'BaseDetail',
        component: BaseDetail,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new ImageStore();
  }
}

export default inject('rootStore')(observer(ImageDetail));
