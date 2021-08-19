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
import { toJS } from 'mobx';
import i18n from 'core/i18n';
import { isAdminPage } from 'utils/index';
import { BellOutlined } from '@ant-design/icons';
import checkItemPolicy from 'resources/policy';
import renderAdminMenu from '../admin-menu';
import renderMenu from '../menu';
import RightContext from './Right';
import LayoutMenu from './Menu';
import styles from './index.less';

@inject('rootStore')
@observer
class BaseLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
    this.init();
  }

  get isAdminPage() {
    const { pathname } = this.props.location;
    return isAdminPage(pathname);
  }

  get rootStore() {
    return this.props.rootStore;
  }

  get noticeCount() {
    return this.rootStore.noticeCount;
  }

  get user() {
    return toJS(this.rootStore.user) || null;
  }

  get hasAdminRole() {
    return this.user && this.rootStore.hasAdminRole;
  }

  get originMenu() {
    if (this.isAdminPage) {
      return renderAdminMenu(i18n.t);
    }
    return renderMenu(i18n.t);
  }

  get menu() {
    const menu = this.filterMenuByHidden(this.originMenu);
    const newMenu = this.getMenuByLicense(menu);
    const filteredMenu = newMenu.filter((it) => {
      const { hasChildren = true, children } = it;
      return !hasChildren || (hasChildren && children.length);
    });
    return filteredMenu;
  }

  get menuAll() {
    // include hide menu
    return this.getMenuByLicense(this.originMenu);
  }

  filterMenuByHidden = (menu = []) => {
    if (menu.length === 0) {
      return menu;
    }
    const newMenu = menu.filter((it) => !it.hidden);
    newMenu.forEach((item) => {
      item.children = this.filterMenuByHidden(item.children);
    });
    return newMenu;
  };

  checkLicenseKey = (key) => this.rootStore.checkLicense(key);

  updateMenuItemByAllowed = (menuItem) => {
    const { licenseKey, policy, children = [], ...rest } = menuItem;
    if (licenseKey && !this.checkLicenseKey(licenseKey)) {
      return null;
    }
    if (policy && !checkItemPolicy({ policy })) {
      return null;
    }
    if (children.length === 0) {
      return menuItem;
    }
    const newChildren = children
      .map((it) => this.updateMenuItemByAllowed(it))
      .filter((it) => !!it);
    return {
      ...rest,
      children: newChildren,
    };
  };

  getMenuByLicense = (menu) => {
    // update menu according to license addons
    const newMenu = [];
    menu.forEach((it) => {
      const result = this.updateMenuItemByAllowed(it);
      if (result) {
        newMenu.push(result);
      }
    });
    return newMenu;
  };

  onCollapseChange = (collapsed) => {
    this.setState({
      collapsed,
    });
  };

  checkPath = (path, pathname, realPath) => {
    if (path instanceof RegExp) {
      return path.test(pathname);
    }
    if (realPath) {
      return pathname === realPath;
    }
    return path === pathname;
  };

  getCurrentMenu = (pathname) => {
    const item = this.menuAll.find((it) => this.checkPath(it.path, pathname));
    if (item) {
      return [item];
    }
    let found = false;
    let ret = [];
    this.menuAll.forEach((detail) => {
      if (!found && detail.children) {
        const current = detail.children.find((it) =>
          this.checkPath(it.path, pathname)
        );
        if (current) {
          found = true;
          ret = [detail, current];
        }
        if (!found) {
          detail.children.forEach((subDetail) => {
            if (subDetail.children) {
              const subCurrent = subDetail.children.find((it) =>
                this.checkPath(it.path, pathname)
              );
              if (subCurrent) {
                found = true;
                ret = [detail, subDetail, subCurrent];
              }
            }
          });
        }
      }
    });
    return ret;
  };

  clearAllNotice = () => {
    const elements = document.getElementsByClassName('ant-notification-notice');
    while (elements.length > 0) {
      elements[0].parentNode.removeChild(elements[0]);
    }
    this.rootStore.clearNoticeCount();
  };

  init() {
    if (this.isAdminPage && !this.hasAdminRole) {
      window.location.href = '/base/overview';
    }
    this.routes = this.props.route.routes;
  }

  renderNotice() {
    if (this.noticeCount < 3) {
      return null;
    }
    return (
      <div className={styles.notice} onClick={this.clearAllNotice}>
        <BellOutlined />
        <span style={{ marginLeft: 8, fontSize: 12 }}>
          {t('Close all notifications.')}
        </span>
      </div>
    );
  }

  render() {
    const { pathname } = this.props.location;
    const currentRoutes = this.getCurrentMenu(pathname);

    return (
      <div className={styles['base-layout']}>
        {this.renderNotice()}
        <LayoutMenu
          pathname={pathname}
          isAdminPage={this.isAdminPage}
          menu={this.menu}
          menuAll={this.menuAll}
          currentRoutes={currentRoutes}
          onCollapseChange={this.onCollapseChange}
        />
        <RightContext
          {...this.props}
          {...this.state}
          currentRoutes={currentRoutes}
          isAdminPage={this.isAdminPage}
        />
      </div>
    );
  }
}

export default BaseLayout;
