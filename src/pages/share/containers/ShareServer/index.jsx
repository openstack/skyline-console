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
import globalShareServerStore from 'stores/manila/share-server';
import { shareServerStatus } from 'resources/manila/share-server';
import actionConfigs from './actions';

export class ShareServer extends Base {
  init() {
    this.store = globalShareServerStore;
  }

  get policy() {
    return 'share_server:index';
  }

  get name() {
    return t('share servers');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID'),
      dataIndex: 'id',
      routeName: 'shareServerDetailAdmin',
      isLink: true,
      withoutName: true,
    },
    {
      title: t('Host'),
      dataIndex: 'host',
      isHideable: true,
    },
    {
      title: t('Project ID/Name'),
      dataIndex: 'project_name',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      valueMap: shareServerStatus,
    },
    {
      title: t('Share Network'),
      dataIndex: 'share_network_name',
      isLink: true,
      routeName: this.getRouteName('shareNetworkDetail'),
      idKey: 'share_network_id',
    },
  ];
}

export default inject('rootStore')(observer(ShareServer));
