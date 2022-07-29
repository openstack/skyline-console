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
import { RoleStore } from 'stores/keystone/role';
import Base from 'containers/TabDetail';
import User from '../../User';
import Group from '../../UserGroup';
import BaseDetail from './BaseDetail';
import actionConfigs from '../actions';

export class RoleDetail extends Base {
  get name() {
    return t('role');
  }

  get policy() {
    return ['identity:get_role', 'identity:list_role_assignments'];
  }

  get listUrl() {
    return this.getRoutePath('role');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  init() {
    this.store = new RoleStore();
  }

  get detailInfos() {
    return [
      {
        title: t('Role Name'),
        dataIndex: 'name',
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
        title: t('Base Info'),
        key: 'base',
        component: BaseDetail,
      },
      {
        title: t('Binding Users'),
        key: 'user',
        component: User,
      },
      {
        title: t('Binding Groups'),
        key: 'group',
        component: Group,
      },
    ];
    return tabs;
  }
}

export default inject('rootStore')(observer(RoleDetail));
