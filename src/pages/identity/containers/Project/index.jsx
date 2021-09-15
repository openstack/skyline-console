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
import { Divider, Badge, Tag, Tooltip } from 'antd';
import Base from 'containers/List';
import globalProjectStore, { ProjectStore } from 'stores/keystone/project';
import {
  yesNoOptions,
  projectTagsColors,
  emptyActionConfig,
} from 'utils/constants';
import actionConfigs from './actions';
import styles from './index.less';

export class Projects extends Base {
  init() {
    this.store = this.inDetailPage ? new ProjectStore() : globalProjectStore;
  }

  get tabs() {
    return [];
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
    const { pathname } = this.props.location;
    return pathname.includes('project-admin');
  }

  get inUserDetail() {
    const { pathname } = this.props.location;
    return this.inDetailPage && pathname.includes('user-admin/detail');
  }

  get inUserGroupDetail() {
    const { pathname } = this.props.location;
    return this.inDetailPage && pathname.includes('user-group-admin/detail');
  }

  getColumns() {
    const columns = [
      {
        title: t('Project ID/Name'),
        dataIndex: 'name',
        linkPrefix: `/identity/${this.getUrl('project')}/detail`,
      },
      {
        title: t('Role'),
        dataIndex: 'projectRole',
        render: (roles, value) => {
          const { groupProjectRole = [] } = value;
          const rolesAll = [...(roles || []), ...(groupProjectRole || [])];
          return (rolesAll || []).map((it) => <div>{it}</div>);
        },
        stringify: (roles, value) => {
          const { groupProjectRole = [] } = value;
          const rolesAll = [...(roles || []), ...(groupProjectRole || [])];
          return (rolesAll || []).join(';');
        },
      },
      {
        title: t('Member Num'),
        dataIndex: 'num',
        isHideable: true,
        render: (name, record) => {
          const { user_num, group_num } = record;
          return (
            <div>
              <span>
                {t('User Num: ')}
                {user_num}
              </span>
              <Divider type="vertical" className={styles['header-divider']} />
              <span>
                {t('User Group Num: ')}
                {group_num}
              </span>
            </div>
          );
        },
        stringify: (name, record) => {
          const { user_num, group_num } = record;
          return `${t('User Num: ')}${user_num} | ${t(
            'User Group Num: '
          )}${group_num}`;
        },
      },
      {
        title: t('Enabled'),
        dataIndex: 'enabled',
        isHideable: true,
        render: (val) => {
          if (val === true) {
            return <Badge color="green" text={t('Yes')} />;
          }
          return <Badge color="red" text={t('No')} />;
        },
        stringify: (enabled) => (enabled ? t('Yes') : t('No')),
      },
      {
        title: t('Tags'),
        dataIndex: 'tags',
        render: (tags) =>
          tags.map((tag, index) => {
            const isLongTag = tag.length > 20;
            const tagEl = (
              <Tag
                key={tag}
                color={projectTagsColors[index % 10]}
                style={{ marginTop: 8 }}
              >
                <span style={{ whiteSpace: 'pre-wrap' }}>
                  {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                </span>
              </Tag>
            );
            return isLongTag ? (
              <Tooltip
                key={tag}
                title={<span style={{ whiteSpace: 'pre-wrap' }}>{tag}</span>}
              >
                {tagEl}
              </Tooltip>
            ) : (
              tagEl
            );
          }),
        isHideable: true,
      },
      {
        title: t('Description'),
        dataIndex: 'description',
        isHideable: true,
      },
    ];

    if (this.inProject) {
      return columns.filter((it) => it.dataIndex !== 'projectRole');
    }

    return columns;
  }

  get actionConfigs() {
    if (this.inUserDetail || this.inUserGroupDetail) {
      return emptyActionConfig;
    }
    return actionConfigs;
  }

  get searchFilters() {
    return [
      {
        label: t('Project Name'),
        name: 'name',
      },
      {
        label: t('Enabled'),
        name: 'enabled',
        options: yesNoOptions,
      },
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

  async getData({ silent, ...params } = {}) {
    const { match } = this.props;
    const { id } = match.params || {};
    const newParams = { ...params };
    silent && (this.list.silent = true);
    if (this.inUserDetail) {
      newParams.userId = id;
      await this.store.fetchListInUserDetail(newParams);
    } else if (this.inUserGroupDetail) {
      newParams.groupId = id;
      await this.store.fetchListInGroupDetail(newParams);
    } else {
      await this.store.fetchList(newParams);
    }
    this.list.silent = false;
  }
}

export default inject('rootStore')(observer(Projects));
