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
import { GroupStore } from 'stores/keystone/user-group';
import Base from 'containers/TabDetail';
import User from '../../User';
import Project from '../../Project';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('user group');
  }

  get policy() {
    return 'identity:get_group';
  }

  get listUrl() {
    return this.getRoutePath('userGroup');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  init() {
    this.store = new GroupStore();
  }

  get detailInfos() {
    return [
      {
        title: t('User Group Name'),
        dataIndex: 'name',
      },
      {
        title: t('Affiliated Domain'),
        dataIndex: 'domain',
        render: (value, record) => (value || {}).name || record.domain_id,
      },
      {
        title: t('User Num'),
        dataIndex: 'userCount',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
      },
    ];
  }

  get tabs() {
    const tabs = [
      {
        title: t('Subordinate Projects'),
        key: 'project',
        component: Project,
      },
      {
        title: t('Sub Users'),
        key: 'user',
        component: User,
      },
    ];
    return tabs;
  }
}

export default inject('rootStore')(observer(Detail));
