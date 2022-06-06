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
import { Badge, Table, Popover } from 'antd';
import Base from 'containers/List';
import globalUserStore, { UserStore } from 'stores/keystone/user';
import { yesNoOptions, emptyActionConfig } from 'utils/constants';
import { Link } from 'react-router-dom';
import { FileTextOutlined } from '@ant-design/icons';
import { enabledColumn } from 'resources/keystone/domain';
import actionConfigs from './actions';
import actionConfigsInDomain from './actionsInDomain';

export class User extends Base {
  init() {
    this.store = this.inDetailPage ? new UserStore() : globalUserStore;
    this.getDomains();
  }

  getDomains() {
    this.store.fetchDomain();
  }

  get tabs() {
    return [];
  }

  get policy() {
    return 'identity:list_users';
  }

  get name() {
    return t('users');
  }

  get inDomainDetail() {
    const {
      match: { path },
    } = this.props;
    return this.inDetailPage && path.includes('domain-admin/detail');
  }

  get inProjectDetail() {
    const {
      match: { path },
    } = this.props;
    return this.inDetailPage && path.includes('project-admin/detail');
  }

  get inUserGroupDetail() {
    const {
      match: { path },
    } = this.props;
    return this.inDetailPage && path.includes('identity/user-group');
  }

  get inRoleDetail() {
    const {
      match: { path },
    } = this.props;
    return this.inDetailPage && path.includes('identity/role-admin');
  }

  getColumns() {
    // const {
    //   match: { path },
    // } = this.props;
    const columns = [
      {
        title: t('User ID/Name'),
        dataIndex: 'name',
        routeName: 'userDetailAdmin',
      },
      {
        title: t('Project Scope'),
        dataIndex: 'projects',
        isHideable: true,
        render: (value) => {
          if (value && value.length) {
            return value.map((it) => {
              const { id, name } = it;
              const url = `/identity/project-admin/detail/${id}`;
              return <Link to={url}>{name}</Link>;
            });
          }
        },
        stringify: (value) => value.map((it) => it.name).join('; '),
      },
      {
        title: t('Roles'),
        dataIndex: 'project_roles',
        isHideable: true,
        render: (project_roles) => {
          if (project_roles && project_roles[0]) {
            return project_roles.map((it, idx) => <div key={idx}>{it}</div>);
          }
        },
      },
      {
        title: t('Real Name'),
        dataIndex: 'real_name',
        isHideable: true,
      },
      {
        title: t('Affiliated Domain'),
        dataIndex: 'domain_name',
        isHideable: true,
      },
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
        title: t('Project Num'),
        dataIndex: 'projectItems',
        render: (_, record) => {
          const { project_num } = record;
          if (project_num === 0) {
            return <Badge color="red" text={project_num} />;
          }
          const { projectItems = [] } = record;
          const projectColumns = [
            {
              title: t('Project'),
              dataIndex: 'name',
              key: 'id',
              render: (value, data) => {
                const url = `/identity/project-admin/detail/${data.id}`;
                return <Link to={url}>{value}</Link>;
              },
            },
            {
              title: t('Role'),
              dataIndex: 'roles',
              key: 'roles',
              render: (value) => {
                if (!value) {
                  return '-';
                }
                return value.map((it) => it.name).join(', ');
              },
            },
          ];
          const table = (
            <Table
              columns={projectColumns}
              dataSource={projectItems}
              pagination={false}
              rowKey="id"
              size="small"
            />
          );
          return (
            <>
              <Badge color="green" text={project_num} />
              <Popover
                getPopupContainer={(node) => node.parentNode}
                placement="right"
                content={table}
                destroyTooltipOnHide
              >
                <FileTextOutlined />
              </Popover>
            </>
          );
        },
        stringify: (value, record) => {
          const { project_num, projectItems = [] } = record;
          const projectRoleStr = projectItems
            .map((it) => {
              const { name, roles } = it;
              const roleStr = roles.map((role) => role.name).join(', ');
              return `${name}: ${roleStr}`;
            })
            .join('\n');
          return `${project_num}\n${projectRoleStr}`;
        },
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
    if (!this.inDetailPage) {
      return columns.filter(
        (it) =>
          !['project_roles', 'projects', 'project_num'].includes(it.dataIndex)
      );
    }
    if (this.inUserGroupDetail) {
      return columns.filter(
        (it) =>
          !['project_roles', 'projects', 'projectItems'].includes(it.dataIndex)
      );
    }
    if (this.inDomainDetail) {
      return columns.filter(
        (it) =>
          ![
            'project_roles',
            'projects',
            'domain_name',
            'projectItems',
          ].includes(it.dataIndex)
      );
    }
    if (this.inRoleDetail) {
      return columns.filter(
        (it) =>
          !['project_roles', 'project_num', 'projectItems'].includes(
            it.dataIndex
          )
      );
    }
    if (this.inProjectDetail) {
      return columns.filter(
        (it) => !['projects', 'projectItems'].includes(it.dataIndex)
      );
    }
    return columns;
  }

  get actionConfigs() {
    if (this.inDomainDetail) {
      return this.isAdminPage
        ? actionConfigsInDomain.adminConfigs
        : actionConfigsInDomain.actionConfigs;
    }
    if (!this.inDetailPage) {
      return this.isAdminPage
        ? actionConfigs.adminConfigs
        : actionConfigs.actionConfigs;
    }
    return emptyActionConfig;
  }

  get searchFilters() {
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
    ];
  }

  async getData({ silent, ...params } = {}) {
    const { match } = this.props;
    const newParams = { ...params };
    silent && (this.list.silent = true);
    if (this.inDomainDetail) {
      const { id } = match.params;
      newParams.domainId = id;
      await this.store.fetchListInDomainDetail(newParams);
    } else if (this.inProjectDetail) {
      const { id } = match.params;
      newParams.projectId = id;
      await this.store.fetchListInProjectDetail(newParams);
    } else if (this.inUserGroupDetail) {
      const { id } = match.params;
      newParams.groupId = id;
      await this.store.fetchListInGroupDetail(newParams);
    } else if (this.inRoleDetail) {
      const { id } = match.params;
      newParams.roleId = id;
      await this.store.fetchListInRoleDetail(newParams);
    } else {
      await this.store.fetchList(newParams);
    }
    this.list.silent = false;
  }
}

export default inject('rootStore')(observer(User));
