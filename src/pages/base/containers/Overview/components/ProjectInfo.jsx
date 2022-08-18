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
import { Card, Descriptions } from 'antd';
import { inject, observer } from 'mobx-react';
import styles from '../style.less';

export class ProjectInfo extends Component {
  get rootStore() {
    return this.props.rootStore || {};
  }

  get currentUser() {
    const { user: { user } = {} } = this.rootStore;
    return user || {};
  }

  get roles() {
    const { roles = [] } = this.rootStore;
    return roles;
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

  renderRoles() {
    return (
      <Descriptions.Item
        label={t('My Role')}
        labelStyle={{ fontSize: 14 }}
        contentStyle={{ fontSize: 14 }}
      >
        {this.roles.map((item) => item.name).join(', ')}
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

  render() {
    if (!this.currentUser.name) {
      return null;
    }
    return (
      <Card
        className={styles.project}
        title={t('Hello, {name}', { name: this.currentUser.name })}
        bordered={false}
      >
        <Descriptions column={1}>
          {this.renderAccount()}
          {this.renderRoles()}
          {this.renderDomain()}
        </Descriptions>
      </Card>
    );
  }
}

export default inject('rootStore')(observer(ProjectInfo));
