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
import { KeypairStore } from 'stores/nova/keypair';
import Base from 'containers/TabDetail';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class KeypairDetail extends Base {
  get name() {
    return t('keypair');
  }

  get policy() {
    return 'os_compute_api:os-keypairs:show';
  }

  get listUrl() {
    return this.getRoutePath('keypair');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get titleValue() {
    return this.detailData.origin_id;
  }

  get detailInfos() {
    return [
      // {
      //   title: t('ID'),
      //   dataIndex: 'id',
      // },
      {
        title: t('Name'),
        dataIndex: 'name',
      },
      {
        title: t('Created At'),
        dataIndex: 'created_at',
        valueRender: 'toLocalTime',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Detail'),
        key: 'detail',
        component: BaseDetail,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new KeypairStore();
  }
}

export default inject('rootStore')(observer(KeypairDetail));
