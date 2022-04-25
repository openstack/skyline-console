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
import { shareStatus } from 'resources/share';

export class ShareInstance extends Base {
  init() {
    this.store = globalShareInstanceStore;
  }

  get policy() {
    return 'manila:share_instance:index';
  }

  get name() {
    return t('share instances');
  }

  get fetchDataByAllProjects() {
    return false;
  }

  getColumns = () => [
    {
      title: t('ID'),
      dataIndex: 'id',
      routeName: 'shareInstanceDetailAdmin',
      isLink: true,
    },
    {
      title: t('Host'),
      dataIndex: 'host',
      isHideable: true,
    },
    {
      title: t('Status'),
      dataIndex: 'status',
      render: (value) => shareStatus[value] || value,
    },
    {
      title: t('Availability Zone'),
      dataIndex: 'availability_zone',
    },
    {
      title: t('Share Network'),
      dataIndex: 'share_network_id',
    },
    {
      title: t('Share Server'),
      dataIndex: 'share_server_id',
    },
    {
      title: t('Share Id'),
      dataIndex: 'share_id',
    },
  ];
}

export default inject('rootStore')(observer(ShareInstance));
