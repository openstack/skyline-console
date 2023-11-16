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
import globalUserStore, { UserStore } from 'stores/keystone/user';
import { yesNoOptions, emptyActionConfig } from 'utils/constants';
import { enabledColumn } from 'resources/keystone/domain';
import actionConfigs from './actions';

export class User extends Base {
  init() {
    this.store = this.inDetailPage ? new UserStore() : globalUserStore;
  }

  get policy() {
    return 'identity:list_users';
  }

  get name() {
    return t('users');
  }

  get inDomainDetail() {
    return this.inDetailPage && this.path.includes('domain-admin/detail');
  }

  get inProjectDetail() {
    return this.inDetailPage && this.path.includes('project-admin/detail');
  }

  get inUserGroupDetail() {
    return this.inDetailPage && this.path.includes('identity/user-group');
  }

  get inRoleDetail() {
    return this.inDetailPage && this.path.includes('identity/role-admin');
  }

  getBaseColumns() {
    return [
      {
        title: t('User ID/Name'),
        dataIndex: 'name',
        routeName: 'userDetailAdmin',
      },
      {
        title: t('Real Name'),
        dataIndex: 'real_name',
        isHideable: true,
      },
      {
        title: t('Default Project ID/Name'),
        dataIndex: 'defaultProject',
        isHideable: true,
        routeName: 'projectDetailAdmin',
        isLink: true,
        idKey: 'default_project_id',
      },
      {
        title: t('Roles'),
        dataIndex: 'projectRoles',
        isHideable: true,
        render: (_, record) => {
          const { projects } = record;
          return Object.values(projects).map((it) => {
            const { roles = [] } = it || {};
            return roles.map((role) => {
              return <div key={role.id}>{role.name}</div>;
            });
          });
        },
        stringify: (_, record) => {
          const { projects } = record;
          return Object.values(projects).map((it) => {
            const { roles = [] } = it || {};
            return roles
              .map((role) => {
                return role.name;
              })
              .join(', ');
          });
        },
      },
      {
        title: t('Project Scope'),
        dataIndex: 'projects',
        isHideable: true,
        render: (value) => {
          return Object.values(value).map((it) => {
            const {
              project: { id, name },
            } = it;
            const link = this.getLinkRender('projectDetail', name, {
              id,
            });
            return <div key={id}>{link}</div>;
          });
        },
        stringify: (value) => {
          return Object.values(value)
            .map((it) => {
              const { project } = it;
              return project.name;
            })
            .join('; ');
        },
      },
      {
        title: t('Affiliated Domain ID/Name'),
        dataIndex: 'domainName',
        isHideable: true,
        routeName: 'domainDetailAdmin',
        isLink: true,
        idKey: 'domain_id',
      },
      {
        title: t('System Roles'),
        dataIndex: 'systemRoles',
        render: (value) => {
          return (value || []).map((it) => <div key={it.id}>{it.name}</div>);
        },
        stringify: (value) => (value || []).map((it) => it.name).join('; '),
      },
      {
        title: t('Email'),
        dataIndex: 'email',
        isHideable: true,
      },
      {
        title: t('phone'),
        dataIndex: 'phone',
        isHideable: true,
      },
      enabledColumn,
    ];
  }

  getColumns() {
    const columns = this.getBaseColumns();
    if (!this.inDetailPage || this.inUserGroupDetail) {
      return columns.filter(
        (it) => !['projectRoles', 'projects'].includes(it.dataIndex)
      );
    }
    if (this.inDomainDetail) {
      return columns.filter(
        (it) =>
          !['domainName', 'projects', 'projectRoles'].includes(it.dataIndex)
      );
    }
    if (this.inRoleDetail) {
      return columns.filter((it) => !['projectRoles'].includes(it.dataIndex));
    }
    if (this.inProjectDetail) {
      return columns.filter((it) => !['projects'].includes(it.dataIndex));
    }
    return columns;
  }

  get actionConfigs() {
    if (this.inDetailPage) {
      return emptyActionConfig;
    }
    return actionConfigs;
  }

  get searchFilters() {
    const domainFilter = this.inDomainDetail
      ? []
      : [
          {
            label: t('Domain Name'),
            name: 'domainName',
          },
        ];
    return [
      {
        label: t('User Name'),
        name: 'name',
      },
      {
        label: t('Real Name'),
        name: 'real_name',
      },
      {
        label: t('Enabled'),
        name: 'enabled',
        options: yesNoOptions,
      },
      ...domainFilter,
    ];
  }

  updateFetchParams = (params) => {
    const { match } = this.props;
    const { id } = match.params || {};
    const newParams = { ...params };
    if (this.inUserGroupDetail) {
      newParams.groupId = id;
      newParams.withProjectRole = false;
      newParams.withSystemRole = true;
      newParams.withDefaultProject = true;
    } else if (this.inDomainDetail) {
      newParams.domain_id = id;
      newParams.withProjectRole = false;
      newParams.withSystemRole = true;
      newParams.withDefaultProject = true;
    } else if (this.inProjectDetail) {
      newParams.projectId = id;
      newParams.withProjectRole = true;
      newParams.withSystemRole = true;
    } else if (this.inRoleDetail) {
      newParams.roleId = id;
      newParams.withProjectRole = true;
      newParams.withSystemRole = true;
    } else if (!this.inDetailPage) {
      newParams.withProjectRole = false;
      newParams.withSystemRole = true;
      newParams.withDefaultProject = true;
    }
    return newParams;
  };
}

export default inject('rootStore')(observer(User));
