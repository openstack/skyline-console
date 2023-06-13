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
import globalGroupStore, { GroupStore } from 'stores/keystone/user-group';
import { Typography } from 'antd';
import { emptyActionConfig } from 'utils/constants';
import { isEmpty } from 'lodash';
import actionConfigs from './actions';

export class UserGroups extends Base {
  init() {
    this.store = this.inDetailPage ? new GroupStore() : globalGroupStore;
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

  get inUserDetail() {
    return this.inDetailPage && this.path.includes('user-admin/detail');
  }

  get inDomainDetail() {
    return this.inDetailPage && this.path.includes('domain-admin/detail');
  }

  get inProjectDetail() {
    return this.inDetailPage && this.path.includes('project-admin/detail');
  }

  get inRoleDetail() {
    return this.inDetailPage && this.path.includes('role-admin/detail');
  }

  getBaseColumns() {
    return [
      {
        title: t('User Group ID/Name'),
        dataIndex: 'name',
        routeName: 'userGroupDetailAdmin',
      },
      {
        title: t('Project Scope (Project Name: Role Names)'),
        dataIndex: 'projects',
        isHideable: true,
        width: 500,
        render: (value) => {
          if (isEmpty(value)) {
            return '-';
          }
          return Object.keys(value).map((projectId) => {
            const { project, roles } = value[projectId];
            const roleNames = roles
              .map((role) => {
                return role.name;
              })
              .join(', ');
            const { id, name } = project;
            const link = this.getLinkRender(
              'projectDetail',
              name,
              { id },
              { tab: 'userGroup' }
            );
            return (
              <div key={projectId}>
                <Typography.Text strong>{link}</Typography.Text>: {roleNames}
              </div>
            );
          });
        },
        stringify: (value) => {
          if (isEmpty(value)) {
            return '-';
          }
          return Object.keys(value)
            .map((projectId) => {
              const { project, roles } = value[projectId];
              const roleNames = roles.map((it) => it.name).join('|');
              return `${project.name}: ${roleNames}`;
            })
            .join(';');
        },
      },
      {
        title: t('Roles'),
        dataIndex: 'rolesInProjectDetailPage',
        isHideable: true,
        render: (_, record) => {
          const { projects = {} } = record;
          if (isEmpty(projects)) {
            return '-';
          }
          return Object.keys(projects).map((projectId) => {
            const { roles } = projects[projectId];
            return roles.map((role) => {
              const { id, name } = role;
              const link = this.getLinkRender(
                'roleDetail',
                name,
                { id },
                { tab: 'group' }
              );
              return <div key={id}>{link}</div>;
            });
          });
        },
        stringify: (_, record) => {
          const { projects = {} } = record;
          if (isEmpty(projects)) {
            return '-';
          }
          return Object.keys(projects).map((projectId) => {
            const { roles } = projects[projectId];
            return roles.map((role) => role.name).join(';');
          });
        },
      },
      {
        title: t('Project Scope'),
        dataIndex: 'projectsInRoleDetailPage',
        isHideable: true,
        render: (_, record) => {
          const { projects = {} } = record;
          if (isEmpty(projects)) {
            return '-';
          }
          return Object.keys(projects).map((projectId) => {
            const { project } = projects[projectId];
            const { id, name } = project;
            const link = this.getLinkRender(
              'projectDetail',
              name,
              { id },
              { tab: 'userGroup' }
            );
            return <div key={id}>{link}</div>;
          });
        },
        stringify: (_, record) => {
          const { projects = {} } = record;
          if (isEmpty(projects)) {
            return '-';
          }
          return Object.keys(projects)
            .map((projectId) => {
              const { project } = projects[projectId];
              return project.name;
            })
            .join(';');
        },
      },
      {
        title: t('Affiliated Domain'),
        dataIndex: 'domainName',
        isHideable: true,
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        isHideable: true,
      },
    ];
  }

  getColumns() {
    const columns = this.getBaseColumns();
    if (!this.inDetailPage || this.inUserDetail) {
      return columns.filter(
        (it) =>
          !['rolesInProjectDetailPage', 'projectsInRoleDetailPage'].includes(
            it.dataIndex
          )
      );
    }
    if (this.inDomainDetail) {
      return columns.filter(
        (it) =>
          ![
            'domainName',
            'rolesInProjectDetailPage',
            'projectsInRoleDetailPage',
          ].includes(it.dataIndex)
      );
    }
    if (this.inProjectDetail) {
      return columns.filter(
        (it) => !['projects', 'projectsInRoleDetailPage'].includes(it.dataIndex)
      );
    }
    if (this.inRoleDetail) {
      return columns.filter(
        (it) => !['projects', 'rolesInProjectDetailPage'].includes(it.dataIndex)
      );
    }
    return columns;
  }

  get actionConfigs() {
    if (!this.inDetailPage) {
      return actionConfigs;
    }
    return emptyActionConfig;
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
        label: t('User Group Name'),
        name: 'name',
      },
      ...domainFilter,
    ];
  }

  updateFetchParams = (params) => {
    const { match } = this.props;
    const { id } = match.params || {};
    const newParams = { ...params };
    if (this.inUserDetail) {
      newParams.userId = id;
    } else if (this.inProjectDetail) {
      newParams.projectId = id;
    } else if (this.inRoleDetail) {
      newParams.roleId = id;
    } else if (this.inDomainDetail) {
      newParams.domainId = id;
    }
    return newParams;
  };
}

export default inject('rootStore')(observer(UserGroups));
