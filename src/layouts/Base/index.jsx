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
import { toJS, reaction } from 'mobx';
import i18n from 'core/i18n';
import { isAdminPage, isUserCenterPage } from 'utils/index';
import { BellOutlined } from '@ant-design/icons';
import checkItemPolicy from 'resources/skyline/policy';
import { Layout } from 'antd';
import GlobalHeader from 'components/Layout/GlobalHeader';
import { setRouteMap, getPath } from 'utils/route-map';
import { getLocalStorageItem } from 'utils/local-storage';
import renderAdminMenu from '../admin-menu';
import renderMenu from '../menu';
import renderUserMenu from '../user-menu';
import RightContext from './Right';
import LayoutMenu from './Menu';
import styles from './index.less';

const { Header } = Layout;

export class BaseLayout extends Component {
  autoReaction = reaction(
    () => (this.props.rootStore.user || {}).keystone_token,
    () => {
      setRouteMap(this.menu);
    }
  );

  constructor(props) {
    super(props);
    this.state = {
      collapsed: getLocalStorageItem('menuCollapsed') || false,
    };
    this.init();
  }

  componentWillUnmount() {
    this.autoReaction();
  }

  get isAdminPage() {
    const { pathname } = this.props.location;
    return isAdminPage(pathname);
  }

  get isUserCenterPage() {
    const { pathname } = this.props.location;
    return isUserCenterPage(pathname);
  }

  get rootStore() {
    return this.props.rootStore;
  }

  get noticeCount() {
    return (
      this.rootStore.noticeCount - (this.rootStore.noticeCountWaitRemove || 0)
    );
  }

  get user() {
    return toJS(this.rootStore.user) || null;
  }

  get hasAdminRole() {
    return this.user && this.rootStore.hasAdminRole;
  }

  get hasAdminPageRole() {
    return this.user && this.rootStore.hasAdminPageRole;
  }

  get originMenu() {
    let ret = [];
    if (this.isUserCenterPage) {
      ret = renderUserMenu(i18n.t);
    } else if (this.isAdminPage) {
      ret = renderAdminMenu(i18n.t);
    } else {
      ret = renderMenu(i18n.t);
    }
    return ret;
  }

  get globalNav() {
    return this.menu;
  }

  get menu() {
    const menu = this.filterMenuByHidden(this.originMenu);
    const newMenu = this.getMenuAllowed(menu);
    const filteredMenu = newMenu.filter((it) => {
      const { hasChildren = true, children } = it;
      return !hasChildren || (hasChildren && children.length);
    });
    return filteredMenu;
  }

  get menuAll() {
    // include hide menu
    return this.getMenuAllowed(this.originMenu);
  }

  getRouteName(routeName) {
    return this.isAdminPage ? `${routeName}Admin` : routeName;
  }

  getRoutePath(routeName, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getPath({ key: realName, params, query });
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

  checkItemEndpoints = (key) => this.rootStore.checkEndpoint(key);

  getMenuAllowed = (menu) => {
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

  updateMenuItemByAllowed(menuItem) {
    const { policy, endpoints, children = [], ...rest } = menuItem;
    if (policy && !checkItemPolicy({ policy })) {
      return null;
    }
    if (endpoints && !this.checkItemEndpoints(endpoints)) {
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
  }

  init() {
    if (this.isAdminPage && !this.hasAdminPageRole) {
      window.location.href = '/base/overview';
    }
    this.routes = this.props.route.routes;
    setRouteMap(this.menu);
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

  renderHeader = () => (
    <GlobalHeader
      {...this.props}
      isAdminPage={this.isAdminPage}
      navItems={this.globalNav}
      isUserCenterPage={this.isUserCenterPage}
    />
  );

  render() {
    const { pathname } = this.props.location;
    const currentRoutes = this.getCurrentMenu(pathname);
    return (
      <div className={styles['base-layout']}>
        {this.renderNotice()}
        <Header className={styles.header}>
          {/* {this.renderLogo()} */}
          {this.renderHeader()}
        </Header>
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

export default inject('rootStore')(observer(BaseLayout));
