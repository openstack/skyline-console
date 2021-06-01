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
import { Button, Divider, Badge } from 'antd';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { UserStore } from 'stores/keystone/user';
import globalDomainStore from 'stores/keystone/domain';
import Base from 'containers/TabDetail';
import UserGroup from '../../UserGroup';
import Project from '../../Project';
import styles from './index.less';
import actionConfigs from '../actions';

@inject('rootStore')
@observer
export default class UserDetail extends Base {
  get name() {
    return t('user');
  }

  get policy() {
    return 'identity:get_user';
  }

  get listUrl() {
    return '/identity/user-admin';
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
      },
      {
        title: t('True Name'),
        dataIndex: 'full_name',
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
        <span className={styles['title-label']}>{t('User ID')}:</span>
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
