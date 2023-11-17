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
import { Divider } from 'antd';
import Base from 'containers/List';
import globalProjectStore, { ProjectStore } from 'stores/keystone/project';
import { yesNoOptions, emptyActionConfig } from 'utils/constants';
import { SimpleTag } from 'resources/nova/instance';
import { enabledColumn } from 'resources/keystone/domain';
import actionConfigs, { actionConfigsInUserDetail } from './actions';
import styles from './index.less';

export class Projects extends Base {
  init() {
    this.store = this.inDetailPage ? new ProjectStore() : globalProjectStore;
  }

  get policy() {
    return 'identity:list_projects';
  }

  get name() {
    return t('projects');
  }

  get isFilterByBackend() {
    return false;
  }

  get inProject() {
    return this.path.includes('project-admin');
  }

  get inUserDetail() {
    return this.inDetailPage && this.path.includes('user-admin/detail');
  }

  get inUserGroupDetail() {
    return this.inDetailPage && this.path.includes('user-group-admin/detail');
  }

  get inDomainDetail() {
    return this.inDetailPage && this.path.includes('domain-admin/detail');
  }

  get forceRefreshTopDetailWhenListRefresh() {
    return this.inUserDetail;
  }

  get refreshDetailDataWithSilence() {
    return !this.inUserDetail;
  }

  getUserProjectRole = (record) => {
    // return [{role, groups}]
    const { users = {}, groups = {} } = record || {};
    const userRoleIds = [];
    const result = [];
    Object.keys(users).forEach((id) => {
      const roles = users[id];
      roles.forEach((r) => {
        result.push({
          role: r,
        });
        userRoleIds.push(r.id);
      });
    });
    Object.keys(groups).forEach((groupId) => {
      const { roles, group } = groups[groupId];
      const leftRoles = roles.filter((r) => !userRoleIds.includes(r.id));
      leftRoles.forEach((r) => {
        const resultItem = result.find((it) => it.role.id === r.id);
        if (resultItem) {
          resultItem.groups.push(group);
        } else {
          result.push({
            role: r,
            groups: [group],
          });
        }
      });
    });
    return result;
  };

  getBaseColumns() {
    const userProjectRole = {
      title: t('Role'),
      dataIndex: 'userProjectRole',
      render: (_, record) => {
        const roles = this.getUserProjectRole(record);
        const links = roles.map((it) => {
          const {
            role: { id, name },
            groups = [],
          } = it;
          if (!groups.length) {
            const link = this.getLinkRender(
              'roleDetail',
              name,
              { id },
              { tab: 'user' }
            );
            return <div key={`user-role-${id}`}>{link}</div>;
          }
          const roleGroupLink = this.getLinkRender(
            'roleDetail',
            name,
            { id },
            { tab: 'groups' }
          );
          const groupLinks = groups.map((g) => {
            const link = this.getLinkRender('groupDetail', g.name, {
              id: g.id,
            });
            return <span style={{ marginRight: '8px' }}>{link}</span>;
          });
          return (
            <div key={`group-role-${id}`}>
              {roleGroupLink} ({t('authorized by group ')}
              {groupLinks})
            </div>
          );
        });
        return <div>{links}</div>;
      },
      stringify: (_, record) => {
        const roles = this.getUserProjectRole(record);
        return roles
          .map((it) => {
            const {
              role: { name },
              groups = [],
            } = it;
            if (!groups.length) {
              return name;
            }
            const groupNames = groups.map((g) => g.name).join('; ');
            return `${name} (${t('authorized by group ')}${groupNames})`;
          })
          .join('; ');
      },
    };

    const groupProjectRole = {
      title: t('Role'),
      dataIndex: 'groupProjectRole',
      render: (_, record) => {
        const { groups: projectRole = {} } = record;
        const tab = 'group';
        return Object.keys(projectRole).map((id) => {
          const roles = projectRole[id];
          return roles.map((role) => {
            const { id: roleId, name } = role;
            const link = this.getLinkRender(
              'roleDetail',
              name,
              { id: roleId },
              { tab }
            );
            return <div key={`${id}-${roleId}`}>{link}</div>;
          });
        });
      },
      stringify: (_, record) => {
        const { groups: projectRole = {} } = record;
        return Object.keys(projectRole).map((id) => {
          const roles = projectRole[id];
          return roles.map((role) => role.name).join(' ; ');
        });
      },
    };
    return [
      {
        title: t('Project ID/Name'),
        dataIndex: 'name',
        routeName: 'projectDetailAdmin',
      },
      userProjectRole,
      groupProjectRole,
      {
        title: t('Member Num'),
        dataIndex: 'num',
        isHideable: true,
        render: (name, record) => {
          const { userCount, groupCount } = record;
          return (
            <div>
              <span>
                {t('User Num: ')}
                {userCount}
              </span>
              <Divider type="vertical" className={styles['header-divider']} />
              <span>
                {t('User Group Num: ')}
                {groupCount}
              </span>
            </div>
          );
        },
        stringify: (name, record) => {
          const { userCount, groupCount } = record;
          return `${t('User Num: ')}${userCount} | ${t(
            'User Group Num: '
          )}${groupCount}`;
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
      enabledColumn,
      {
        title: t('Tags'),
        dataIndex: 'tags',
        render: (tags) => tags.map((tag, index) => SimpleTag({ tag, index })),
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

    if (this.inProject) {
      return columns.filter(
        (it) => !['userProjectRole', 'groupProjectRole'].includes(it.dataIndex)
      );
    }
    if (this.inDomainDetail) {
      return columns.filter(
        (it) =>
          !['domainName', 'userProjectRole', 'groupProjectRole'].includes(
            it.dataIndex
          )
      );
    }
    if (this.inUserDetail) {
      return columns.filter(
        (it) => !['num', 'groupProjectRole'].includes(it.dataIndex)
      );
    }
    if (this.inUserGroupDetail) {
      return columns.filter(
        (it) => !['num', 'userProjectRole'].includes(it.dataIndex)
      );
    }

    return columns;
  }

  get actionConfigs() {
    if (this.inDetailPage) {
      if (this.inUserDetail) {
        return actionConfigsInUserDetail;
      }
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
        label: t('Project Name'),
        name: 'name',
      },
      {
        label: t('Project ID'),
        name: 'id',
      },
      {
        label: t('Enabled'),
        name: 'enabled',
        options: yesNoOptions,
      },
      ...domainFilter,
      {
        label: t('Tags'),
        name: 'tags',
        filterFunc: (val, filterVal) => {
          const lFilterVal = filterVal.toLowerCase();
          return val.some((tag) => tag.toLowerCase().includes(lFilterVal));
        },
      },
    ];
  }

  updateFetchParams = (params) => {
    const { match } = this.props;
    const { id } = match.params || {};
    const newParams = { ...params };
    if (this.inUserDetail) {
      newParams.userId = id;
    } else if (this.inUserGroupDetail) {
      newParams.groupId = id;
    } else if (this.inDomainDetail) {
      newParams.domain_id = id;
    }
    return newParams;
  };
}

export default inject('rootStore')(observer(Projects));
