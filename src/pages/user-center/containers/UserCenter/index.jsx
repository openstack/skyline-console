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
import { inject, observer } from 'mobx-react';
import { Row, Layout, Col, Avatar } from 'antd';
import globalUserStore from 'stores/keystone/user';
import ProfileIcon from 'asset/image/profile.svg';
import classnames from 'classnames';
import styles from './styles.less';

export class Overview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detail: {},
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  async fetchData() {
    const {
      user: { user },
    } = this.props.rootStore;
    const detail = await globalUserStore.pureFetchDetail({ id: user.id });
    this.setState({
      detail,
    });
  }

  renderInfoItem(item) {
    return (
      <Row className={styles['user-info-detail-item']}>
        <Col span={6}>{item.label}</Col>
        <Col span={18}>{item.value}</Col>
      </Row>
    );
  }

  renderUserInfo() {
    const { detail = {} } = this.state;
    const data = {
      [t('Username')]: detail.name || '-',
      [t('Email')]: detail.email || '-',
      [t('Phone')]: detail.phone || '-',
      [t('Real Name')]: detail.real_name || '-',
      [t('User ID')]: detail.id,
    };
    return (
      <>
        <Col
          span={3}
          className={classnames(styles.hvc, styles['user-info-avatar'])}
        >
          <Avatar
            size={{ xs: 33, sm: 44, md: 55, lg: 88, xl: 110, xxl: 138 }}
            src={ProfileIcon}
          />
        </Col>
        <Col span={21}>
          <Row className={styles['user-info-detail']}>
            {Object.keys(data).map((item) => {
              return (
                <Col span={12} key={`user_info_detail_${item}`}>
                  {this.renderInfoItem({
                    label: item,
                    value: data[item],
                  })}
                </Col>
              );
            })}
          </Row>
        </Col>
      </>
    );
  }

  renderExtra() {
    return null;
  }

  render() {
    return (
      <Layout.Content className={styles.content}>
        <Row className={classnames(styles.bgc, styles['user-info-card'])}>
          {this.renderUserInfo()}
        </Row>
        {this.renderExtra()}
      </Layout.Content>
    );
  }
}

export default inject('rootStore')(observer(Overview));
