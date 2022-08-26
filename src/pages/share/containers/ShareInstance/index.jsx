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
import globalShareInstanceStore from 'stores/manila/share-instance';
import { shareStatus } from 'resources/manila/share';
import actionConfigs from './actions';

export class ShareInstance extends Base {
  init() {
    this.store = globalShareInstanceStore;
  }

  get policy() {
    return 'share_instance:index';
  }

  get name() {
    return t('share instances');
  }

  get fetchDataByAllProjects() {
    return false;
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID'),
      dataIndex: 'id',
      routeName: 'shareInstanceDetailAdmin',
      isLink: true,
      withoutName: true,
    },
    {
      title: t('Host'),
      dataIndex: 'host',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      valueMap: shareStatus,
    },
    {
      title: t('Availability Zone'),
      dataIndex: 'availability_zone',
    },
    {
      title: t('Share Network'),
      dataIndex: 'share_network_id',
      isLink: true,
      routeName: this.getRouteName('shareNetworkDetail'),
      idKey: 'share_network_id',
      withoutName: true,
    },
    {
      title: t('Share Server'),
      dataIndex: 'share_server_id',
      isLink: true,
      routeName: this.getRouteName('shareServerDetail'),
      idKey: 'share_server_id',
      withoutName: true,
    },
    {
      title: t('Share Id'),
      dataIndex: 'share_id',
      isLink: true,
      routeName: this.getRouteName('shareDetail'),
      idKey: 'share_id',
      withoutName: true,
    },
  ];
}

export default inject('rootStore')(observer(ShareInstance));
