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
import { ShareInstanceStore } from 'stores/manila/share-instance';
import Base from 'containers/TabDetail';
import { shareStatus } from 'resources/manila/share';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('share instance');
  }

  get policy() {
    return 'share_instance:show';
  }

  get listUrl() {
    return this.getRoutePath('shareInstance');
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
        valueMap: shareStatus,
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
    ];
  }

  init() {
    this.store = new ShareInstanceStore();
  }
}

export default inject('rootStore')(observer(Detail));
