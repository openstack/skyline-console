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
import { ShareServerStore } from 'stores/manila/share-server';
import Base from 'containers/TabDetail';
import { shareServerStatus } from 'resources/manila/share-server';
import Share from 'pages/share/containers/Share';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('share server');
  }

  get policy() {
    return 'share_server:show';
  }

  get listUrl() {
    return this.getRoutePath('shareServer');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Host'),
        dataIndex: 'host',
      },
      {
        title: t('Status'),
        dataIndex: 'status',
        valueMap: shareServerStatus,
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
    return [
      {
        title: t('Base Info'),
        key: 'baseInfo',
        component: BaseDetail,
      },
      {
        title: t('Shares'),
        key: 'share',
        component: Share,
      },
    ];
  }

  init() {
    this.store = new ShareServerStore();
  }
}

export default inject('rootStore')(observer(Detail));
