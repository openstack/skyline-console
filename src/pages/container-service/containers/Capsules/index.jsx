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

import Base from 'containers/List';
import { inject, observer } from 'mobx-react';
import globalCapsulesStore from 'stores/zun/capsules';
import { capsuleStatus } from 'resources/zun/capsule';
import actionConfigs from './actions';

export class Capsules extends Base {
  init() {
    this.store = globalCapsulesStore;
    this.downloadStore = globalCapsulesStore;
  }

  get name() {
    return t('capsules');
  }

  get policy() {
    return 'capsule:get_all';
  }

  get actionConfigs() {
    return actionConfigs;
  }

  getColumns = () => [
    {
      title: t('ID/Name'),
      dataIndex: 'meta_name',
      isLink: true,
      routeName: this.getRouteName('zunCapsuleDetail'),
      idKey: 'uuid',
    },
    {
      title: t('Status'),
      isHideable: true,
      dataIndex: 'status',
      render: (value) => capsuleStatus[value] || value,
    },
    {
      title: t('CPU'),
      isHideable: true,
      dataIndex: 'cpu',
    },
    {
      title: t('Memory'),
      isHideable: true,
      dataIndex: 'memory',
    },
  ];
}

export default inject('rootStore')(observer(Capsules));
