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

import React, { Component } from 'react';
import { Card, Descriptions, Button } from 'antd';
import { inject, observer } from 'mobx-react';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import styles from '../style.less';

export class ProjectInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };
  }

  onCollapsedCallback = () => {};

  handleDetailInfo = () => {
    const { collapsed } = this.state;
    this.setState(
      {
        collapsed: !collapsed,
      },
      () => {
        this.onCollapsedCallback(!collapsed);
      }
    );
  };

  get rootStore() {
    return this.props.rootStore || {};
  }

  get currentUser() {
    const { user: { user } = {} } = this.rootStore;
    return user || {};
  }

  get showRoles() {
    const { roles = [], baseRoles = [] } = this.rootStore;
    return roles.filter((it) => baseRoles.indexOf(it.name) === -1);
  }

  get baseRoles() {
    const { roles = [], baseRoles = [] } = this.rootStore;
    return roles.filter((it) => baseRoles.indexOf(it.name) !== -1);
  }

  renderAccount() {
    return (
      <Descriptions.Item
        label={t('User Account')}
        labelStyle={{ fontSize: 14 }}
        contentStyle={{ fontSize: 14 }}
      >
        {this.currentUser.name}
      </Descriptions.Item>
    );
  }

  renderShowRole() {
    return (
      <Descriptions.Item
        label={t('My Role')}
        labelStyle={{ fontSize: 14 }}
        contentStyle={{ fontSize: 14 }}
      >
        {this.showRoles.map((item) => item.name).join(', ')}
      </Descriptions.Item>
    );
  }

  renderDomain() {
    return (
      <Descriptions.Item
        label={t('Affiliated Domain')}
        labelStyle={{ fontSize: 14 }}
        contentStyle={{ fontSize: 14 }}
      >
        {this.currentUser.domain.name}
      </Descriptions.Item>
    );
  }

  renderBaseRole() {
    const { collapsed } = this.state;
    if (collapsed) {
      return null;
    }

    return (
      <Descriptions.Item
        label={t('Base Role')}
        labelStyle={{ fontSize: 14 }}
        contentStyle={{ fontSize: 14 }}
      >
        {this.baseRoles.map((item) => item.name).join(', ')}
      </Descriptions.Item>
    );
  }

  renderButton() {
    const { collapsed } = this.state;
    const icon = collapsed ? <DownOutlined /> : <UpOutlined />;
    return (
      <Button
        onClick={this.handleDetailInfo}
        icon={icon}
        type="link"
        className={styles['role-button']}
      />
    );
  }

  render() {
    if (!this.currentUser.name) {
      return null;
    }
    return (
      <Card
        className={styles.project}
        title={`Hello, ${this.currentUser.name}`}
        bordered={false}
      >
        <Descriptions column={1}>
          {this.renderAccount()}
          {this.renderShowRole()}
          {this.renderDomain()}
          {this.renderBaseRole()}
        </Descriptions>
        {this.renderButton()}
      </Card>
    );
  }
}

export default inject('rootStore')(observer(ProjectInfo));
