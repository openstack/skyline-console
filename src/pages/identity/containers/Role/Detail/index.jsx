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
import { inject, observer } from 'mobx-react';
import { Button, Divider } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { RoleStore } from 'stores/keystone/role';
import Base from 'containers/TabDetail';
import User from '../../User';
import Group from '../../UserGroup';
import impliedRole from './BaseDetail';
import styles from './index.less';

@inject('rootStore')
@observer
export default class RoleDetail extends Base {
  get name() {
    return t('role');
  }

  get policy() {
    return ['identity:get_role', 'identity:list_role_assignments'];
  }

  get listUrl() {
    return '/identity/role-admin';
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
        title: t('Role Power'),
        key: 'role',
        component: impliedRole,
      },
      {
        title: t('Binding User'),
        key: 'user',
        component: User,
      },
      {
        title: t('Binding Group'),
        key: 'group',
        component: Group,
      },
    ];
    return tabs;
  }

  get detailTitle() {
    const {
      detail: { id },
    } = this.store;
    const { collapsed } = this.state;
    const icon = collapsed ? <DownOutlined /> : <UpOutlined />;
    return (
      <div>
        <span className={styles['title-label']}>{t('Role Id')}:</span>
        <span className={styles['header-title']}>{id}</span>
        <Divider type="vertical" className={styles['header-divider']} />
        <Button onClick={this.goBack} type="link">
          {t('Back')}
        </Button>
        <Button
          onClick={this.handleDetailInfo}
          icon={icon}
          type="link"
          className={styles['header-button']}
        />
      </div>
    );
  }
}
