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
import { Menu, Spin, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import i18n from 'core/i18n';
import ItemActionButtons from 'components/Tables/Base/ItemActionButtons';
import Password from './Password';
import Token from './Token';
import OpenRc from './OpenRc';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const { getLocale, setLocale } = i18n;

export class AvatarDropdown extends React.Component {
  get rootStore() {
    return this.props.rootStore || {};
  }

  get user() {
    const { user } = this.rootStore;
    return user || null;
  }

  changeLang = (language) => setLocale(language, true);

  onMenuClick = (event) => {
    const { key } = event;
    // eslint-disable-next-line no-console
    console.log(key);
  };

  handleLogout = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this.rootStore.logout();
  };

  // eslint-disable-next-line no-unused-vars
  afterChangePassword = (success, fail) => {
    if (success) {
      this.rootStore.logout();
    }
  };

  render() {
    if (!this.user) {
      return (
        <Spin
          size="small"
          style={{
            marginLeft: 8,
            marginRight: 8,
          }}
        />
      );
    }
    const { name: username } = this.user.user;
    const selectedLang = getLocale();
    // const { selectedLang } = this.state.selectedLang;
    const menuHeaderDropdown = (
      <Menu className={styles.menu} onClick={this.onMenuClick}>
        <Menu.Item
          key="user"
          className={`${styles['no-hover']} ${styles['name-item']} ${styles['menu-item']}`}
        >
          <span>
            <span className={styles['user-label']}>{t('User')}</span>
            <span>{username}</span>
          </span>
          <Button
            type="link"
            onClick={this.handleLogout}
            className={`${styles.logout} ${styles['no-padding-top']}`}
          >
            {t('Sign Out')}
          </Button>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key="language"
          className={`${styles['no-hover']} ${styles['menu-item']}`}
        >
          <span>{t('Switch Language')}</span>
          <span style={{ float: 'right' }}>
            <Button
              className={styles['no-padding-top']}
              type="link"
              disabled={selectedLang === 'zh-cn'}
              onClick={() => {
                this.changeLang('zh-cn');
              }}
            >
              CN
            </Button>
            <span>/</span>
            <Button
              type="link"
              disabled={selectedLang === 'en'}
              onClick={() => {
                this.changeLang('en');
              }}
            >
              EN
            </Button>
          </span>
        </Menu.Item>
        <Menu.Item key="password" className={styles['menu-item']}>
          <ItemActionButtons
            actions={{ moreActions: [{ action: Password }] }}
            onFinishAction={this.afterChangePassword}
            item={this.user && this.user.user}
            isWide
          />
        </Menu.Item>
        <Menu.Item key="token" className={styles['menu-item']}>
          <ItemActionButtons
            actions={{ moreActions: [{ action: Token }] }}
            isWide
          />
        </Menu.Item>
        <Menu.Item key="openrc" className={styles['menu-item']}>
          <ItemActionButtons
            actions={{ moreActions: [{ action: OpenRc }] }}
            isWide
          />
        </Menu.Item>
      </Menu>
    );
    // return currentUser && currentUser.name ? menuHeaderDropdown : null;
    return (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <div className={`${styles.action}`}>
          <Button
            shape="circle"
            icon={<UserOutlined />}
            className={styles.avatar}
            href="/user/center"
          />
        </div>
      </HeaderDropdown>
    );
  }
}

export default inject('rootStore')(observer(AvatarDropdown));
