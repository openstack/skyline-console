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
import { Layout } from 'antd';
import ProfileSvgIcon from 'asset/image/profile.svg';
import globalUserStore from 'stores/keystone/user';
import CubeCard from 'components/cube/CubeCard';
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
      <div className={styles['user-info-detail-item']}>
        <div className={styles['item-title']}>{item.label}</div>
        <div className={styles['item-text']}>{item.value}</div>
      </div>
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
      <div className={styles['user-info-card']}>
        <ProfileSvgIcon />
        <div className={styles['user-info-detail']}>
          {Object.keys(data).map((item) => {
            return (
              <div key={`user_info_detail_${item}`}>
                {this.renderInfoItem({
                  label: item,
                  value: data[item],
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderExtra() {
    return null;
  }

  render() {
    return (
      <Layout.Content className={styles.content}>
        <CubeCard>{this.renderUserInfo()}</CubeCard>
        {this.renderExtra()}
      </Layout.Content>
    );
  }
}

export default inject('rootStore')(observer(Overview));
