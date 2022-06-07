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
import { UserStore } from 'stores/keystone/user';
import globalDomainStore from 'stores/keystone/domain';
import Base from 'containers/TabDetail';
import Credentials from 'src/pages/user-center/containers/Credentials';
import { enabledColumn } from 'resources/keystone/domain';
import UserGroup from '../../UserGroup';
import Project from '../../Project';
import actionConfigs from '../actions';

export class UserDetail extends Base {
  get name() {
    return t('user');
  }

  get policy() {
    return 'identity:get_user';
  }

  get listUrl() {
    return this.getRoutePath('user');
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.adminConfigs
      : actionConfigs.actionConfigs;
  }

  init() {
    this.store = new UserStore();
    this.domainStore = globalDomainStore;
    this.getDomains();
  }

  getDomains() {
    this.domainStore.fetchDomain();
  }

  get domainList() {
    const { domains } = this.domainStore;
    return domains || [];
  }

  goEdit = () => {
    const {
      params: { id },
    } = this.props.match;
    this.routing.push(`${this.listUrl}/edit/${id}`);
  };

  get detailInfos() {
    return [
      {
        title: t('User Name'),
        dataIndex: 'name',
      },
      enabledColumn,
      {
        title: t('Real Name'),
        dataIndex: 'real_name',
      },
      // {
      //   title: t('User Group Num'),
      //   dataIndex: 'group_num',
      // },
      {
        title: t('Affiliated Domain'),
        dataIndex: 'domain_id',
        isHideable: true,
        render: (domain_id) => {
          const domain = this.domainList.filter((it) => it.id === domain_id);
          if (domain[0]) {
            return domain[0].name;
          }
          return domain_id;
        },
      },
      {
        title: t('Email'),
        dataIndex: 'email',
        render: (email) => email || '-',
      },
      {
        title: t('phone'),
        dataIndex: 'phone',
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
        title: t('Subordinate Project'),
        key: 'user',
        component: Project,
      },
      {
        title: t('Subordinate User Group'),
        key: 'userGroup',
        component: UserGroup,
      },
      {
        title: t('Application Credentials'),
        key: 'applicationCredentials',
        component: Credentials,
      },
    ];
    return tabs;
  }
}

export default inject('rootStore')(observer(UserDetail));
