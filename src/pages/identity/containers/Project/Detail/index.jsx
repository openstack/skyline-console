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
import { ProjectStore } from 'stores/keystone/project';
import Base from 'containers/TabDetail';
import { enabledColumn } from 'resources/keystone/domain';
import UserGroup from '../../UserGroup';
import User from '../../User';
import Quota from './Quota';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('project');
  }

  get policy() {
    return 'identity:list_projects';
  }

  get listUrl() {
    return this.getRoutePath('project');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  init() {
    this.store = new ProjectStore();
  }

  get forceLoadingTabs() {
    return ['quota'];
  }

  get detailInfos() {
    return [
      {
        title: t('Project Name'),
        dataIndex: 'name',
      },
      enabledColumn,
      {
        title: t('Affiliated Domain'),
        dataIndex: 'domainName',
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
        title: t('Tags'),
        dataIndex: 'tags',
        render: (tags) => tags.join(','),
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
        title: t('Project Users'),
        key: 'user',
        component: User,
      },
      {
        title: t('Project User Groups'),
        key: 'userGroup',
        component: UserGroup,
      },
      {
        title: t('Project Quota'),
        key: 'quota',
        component: Quota,
      },
    ];
    return tabs;
  }
}

export default inject('rootStore')(observer(Detail));
