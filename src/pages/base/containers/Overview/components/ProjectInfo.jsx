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

class ProjectInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };
  }

  onCollapedCallback = () => {};

  handleDetailInfo = () => {
    const { collapsed } = this.state;
    this.setState(
      {
        collapsed: !collapsed,
      },
      () => {
        this.onCollapedCallback(!collapsed);
      }
    );
  };

  render() {
    const { rootStore = {} } = this.props;
    const { roles = [], baseRoles = [], user = {} } = rootStore;
    const { collapsed } = this.state;
    const icon = collapsed ? <DownOutlined /> : <UpOutlined />;
    if (!user) {
      return null;
    }
    const { user: currentUser } = user;
    const showRole = roles.filter((it) => baseRoles.indexOf(it.name) === -1);
    const baseRole = roles.filter((it) => baseRoles.indexOf(it.name) !== -1);

    return (
      <Card
        className={styles.top}
        title={`Hello, ${currentUser.name}`}
        bordered={false}
      >
        <Descriptions column={1}>
          <Descriptions.Item label={t('User Account')}>
            {currentUser.name}
          </Descriptions.Item>
          <Descriptions.Item label={t('My Role')}>
            {showRole.map((item) => item.name).join(', ')}
          </Descriptions.Item>
          <Descriptions.Item label={t('Affiliated Domain')}>
            {currentUser.domain.name}
          </Descriptions.Item>
          {collapsed ? null : (
            <Descriptions.Item label={t('Base Role')}>
              {baseRole.map((item) => item.name).join(', ')}
            </Descriptions.Item>
          )}
        </Descriptions>
        <Button
          onClick={this.handleDetailInfo}
          icon={icon}
          type="link"
          className={styles.role_button}
        />
      </Card>
    );
  }
}

export default inject('rootStore')(observer(ProjectInfo));
