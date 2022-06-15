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
import { DomainStore } from 'stores/keystone/domain';
import Base from 'containers/TabDetail';
import { enabledColumn } from 'resources/keystone/domain';
import User from '../../User';
import UserGroup from '../../UserGroup';
import Project from '../../Project';
import actionConfigs from '../actions';

export class DomainDetail extends Base {
  get name() {
    return t('domain');
  }

  get policy() {
    return 'identity:get_domain';
  }

  get listUrl() {
    return this.getRoutePath('domain');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  get detailInfos() {
    return [
      {
        title: t('Domain Name'),
        dataIndex: 'name',
      },
      enabledColumn,
      {
        title: t('Project Num'),
        dataIndex: 'projectCount',
      },
      {
        title: t('User Num'),
        dataIndex: 'userCount',
      },
      {
        title: t('User Group Num'),
        dataIndex: 'groupCount',
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
        title: t('Projects'),
        key: 'project',
        component: Project,
      },
      {
        title: t('Users'),
        key: 'user',
        component: User,
      },
      {
        title: t('User Groups'),
        key: 'userGroup',
        component: UserGroup,
      },
    ];
    return tabs;
  }

  init() {
    this.store = new DomainStore();
  }
}

export default inject('rootStore')(observer(DomainDetail));
