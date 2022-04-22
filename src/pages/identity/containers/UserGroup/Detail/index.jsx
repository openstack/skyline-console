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
import globalDomainStore from 'stores/keystone/domain';
import { GroupStore } from 'stores/keystone/user-group';
import Base from 'containers/TabDetail';
import User from '../../User';
import Project from '../../Project';
import styles from './index.less';
import actionConfigs from '../actions';

export class Detail extends Base {
  get name() {
    return t('user group');
  }

  get policy() {
    return 'identity:get_group';
  }

  get listUrl() {
    return this.getRoutePath('userGroup');
  }

  get actionConfigs() {
    return actionConfigs;
  }

  init() {
    this.store = new GroupStore();
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

  get detailInfos() {
    return [
      {
        title: t('User Group Name'),
        dataIndex: 'name',
      },
      // {
      //   title: t('People Num'),
      //   dataIndex: 'user_num',
      // },
      {
        title: t('Affiliated Domain'),
        dataIndex: 'domain_id',
        render: (domain_id) => {
          const domain = this.domainList.filter((it) => it.id === domain_id);
          if (domain[0]) {
            return domain[0].name;
          }
          return domain_id;
        },
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
        key: 'project',
        component: Project,
      },
      {
        title: t('Sub User'),
        key: 'userGroup',
        component: User,
      },
    ];
    return tabs;
  }

  goEdit = () => {
    const {
      params: { id },
    } = this.props.match;
    this.routing.push(`${this.listUrl}/edit/${id}`);
  };

  get detailTitle() {
    const {
      detail: { id },
    } = this.store;
    const { collapsed } = this.state;
    const icon = collapsed ? <DownOutlined /> : <UpOutlined />;
    return (
      <div>
        <span className={styles['title-label']}>{t('User Group ID')}:</span>
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

export default inject('rootStore')(observer(Detail));
