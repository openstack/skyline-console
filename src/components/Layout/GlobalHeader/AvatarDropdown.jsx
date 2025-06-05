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
import { Menu, Spin, Button, Select } from 'antd';
import i18n from 'core/i18n';
import UserSvgIcon from 'asset/cube/monochrome/user.svg';
import ItemActionButtons from 'components/Tables/Base/ItemActionButtons';
import Password from './Password';
import Token from './Token';
import OpenRc from './OpenRc';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

const { getLocale, setLocale, SUPPORT_LOCALES } = i18n;

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

  onClickSelectLanguage = (e) => {
    e && e.preventDefault();
    e && e.stopPropagation();
  };

  renderLanguageSwitch() {
    const selectedLang = getLocale();
    const { length } = SUPPORT_LOCALES;
    if (length > 3) {
      const options = SUPPORT_LOCALES.map((it) => ({
        label: it.icon.toLocaleUpperCase(),
        value: it.value,
      }));
      return (
        <div style={{ float: 'right' }}>
          <Select
            className="language-select"
            options={options}
            value={selectedLang}
            onChange={this.changeLang}
            onClick={this.onClickSelectLanguage}
          />
        </div>
      );
    }
    const btns = SUPPORT_LOCALES.map((item, index) => {
      const { value, icon } = item;
      return (
        <>
          <Button
            className={index === 0 ? styles['no-padding-top'] : ''}
            type="link"
            disabled={selectedLang === value}
            onClick={() => {
              this.changeLang(value);
            }}
          >
            {icon.toUpperCase()}
          </Button>
          {index !== length - 1 && <span>/</span>}
        </>
      );
    });
    return <span style={{ float: 'right' }}>{btns}</span>;
  }

  renderLanguageMenuItem() {
    if (SUPPORT_LOCALES.length <= 1) {
      return null;
    }
    return (
      <Menu.Item
        key="language"
        className={`${styles['no-hover']} ${styles['menu-item']} ${styles['language-item']}`}
      >
        <span>{t('Switch Language')}</span>
        {this.renderLanguageSwitch()}
      </Menu.Item>
    );
  }

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
    // const { selectedLang } = this.state.selectedLang;
    const menuHeaderDropdown = (
      <Menu className={styles.menu} onClick={this.onMenuClick}>
        <Menu.Item
          key="user"
          className={`${styles['no-hover']} ${styles['name-item']} ${styles['menu-item']}`}
        >
          <span className={styles['user-label-wrap']}>
            <span className={styles['user-label']}>{t('User')}</span>
            <span>{username}</span>
          </span>
          <Button
            type="link"
            onClick={this.handleLogout}
            className={`${styles['menu-btn']} ${styles.logout} ${styles['no-padding-top']}`}
          >
            {t('Sign Out')}
          </Button>
        </Menu.Item>
        <Menu.Divider className={styles['menu-divider']} />
        {this.renderLanguageMenuItem()}
        <Menu.Divider className={styles['menu-divider']} />
        <Menu.Item key="userCenter" className={styles['menu-item']}>
          <Button href="/user/center" type="link">
            {t('User Center')}
          </Button>
        </Menu.Item>
        <Menu.Divider className={styles['menu-divider']} />
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
            icon={<UserSvgIcon width={16} height={16} />}
            className={styles.avatar}
          />
        </div>
      </HeaderDropdown>
    );
  }
}

export default inject('rootStore')(observer(AvatarDropdown));
