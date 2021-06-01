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

import React from 'react';
import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalGroupStore from 'stores/keystone/user-group';
import { Badge } from 'antd';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

@inject('rootStore')
@observer
export default class UserGroups extends Base {
  init() {
    this.store = globalGroupStore;
  }

  get tabs() {
    return [];
  }

  get policy() {
    return 'identity:list_groups';
  }

  get name() {
    return t('user groups');
  }

  get isFilterByBackend() {
    return false;
  }

  getColumns = () => {
    const {
      match: { path },
    } = this.props;
    const components = [
      {
        title: t('User Group ID/Name'),
        dataIndex: 'name',
        linkPrefix: '/identity/user-group-admin/detail',
      },
      {
        title: t('Project Scope'),
        dataIndex: 'projectScope',
        isHideable: true,
        render: (projectScope) => {
          if (projectScope && projectScope[0]) {
            return projectScope.map((it) => <div>{it}</div>);
          }
        },
      },
      // {
      //   title: t('System Scope'),
      //   dataIndex: 'systemScope',
      //   isHideable: true,
      //   render: (systemScope) => {
      //     if (systemScope === true) {
      //       return 'All';
      //     }
      //     return '-';
      //   },
      // },
      {
        title: t('Project Num'),
        dataIndex: 'project_num',
        render: (project_num) => {
          if (project_num === 0) {
            return <Badge color="red" text={project_num} />;
          }
          return <Badge color="green" text={project_num} />;
        },
      },
      {
        title: t('User Num'),
        dataIndex: 'user_num',
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        isHideable: true,
      },
    ];

    if (path.indexOf('role-admin/detail') === -1) {
      components.splice(1, 1);
    }
    if (path.indexOf('user-group-admin') === -1) {
      components.splice(2, 1);
    }
    return components;
  };

  get actionConfigs() {
    const {
      match: { path },
    } = this.props;
    if (path.indexOf('identity/user-group') >= 0) {
      return actionConfigs;
    }
    return emptyActionConfig;
  }

  get searchFilters() {
    return [
      {
        label: t('User Group Name'),
        name: 'name',
      },
    ];
  }

  async getData({ silent, ...params } = {}) {
    const { match } = this.props;
    const { path } = match;
    const newParams = { ...params };
    if (path.indexOf('project-admin/detail') >= 0) {
      const { id } = match.params;
      newParams.projectId = id;
      await this.store.fetchListInProjectDetail(newParams);
    } else if (path.indexOf('user-admin/detail') >= 0) {
      const { id } = match.params;
      newParams.userId = id;
      await this.store.fetchListInUserDetail(newParams);
    } else if (path.indexOf('role-admin/detail') >= 0) {
      const { id } = match.params;
      newParams.roleId = id;
      await this.store.fetchListInRoleDetail(newParams);
    } else {
      await this.store.fetchList(newParams);
    }
    this.list.silent = false;
  }
}
