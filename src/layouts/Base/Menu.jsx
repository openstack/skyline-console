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
import { Menu, Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { isString, isEqual } from 'lodash';
import classnames from 'classnames';
import { getPath } from 'utils/route-map';
import { getLocalStorageItem, setLocalStorageItem } from 'utils/local-storage';
import i18n from 'core/i18n';
import styles from './index.less';

const { SubMenu } = Menu;

const { getLocaleShortName } = i18n;

export class LayoutMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: getLocalStorageItem('menuCollapsed') || false,
      hover: false,
      openKeys: [],
    };
    const shortName = getLocaleShortName();
    this.maxTitleLength = shortName === 'zh' ? 9 : 17;
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    const { pathname } = this.props;
    const { pathname: prevPathname } = prevProps;
    if (prevPathname && pathname !== prevPathname) {
      this.updateOpenKeysByRoute();
    }
  }

  get menu() {
    return this.props.menu || [];
  }

  get isAdminPage() {
    return this.props.isAdminPage || false;
  }

  getRouteName(routeName) {
    return this.isAdminPage ? `${routeName}Admin` : routeName;
  }

  getRoutePath(routeName, params = {}, query = {}) {
    const realName = this.getRouteName(routeName);
    return getPath({ key: realName, params, query });
  }

  getOpenKeysByRoute() {
    const { currentRoutes } = this.props;
    const selectedKeys = this.getSelectedKeys(currentRoutes);
    const currentOpenKeys = this.getCurrentOpenKeys(selectedKeys);
    return currentOpenKeys;
  }

  get rootStore() {
    return this.props.rootStore;
  }

  get routing() {
    return this.props.rootStore.routing;
  }

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  };

  changeCollapse = () => {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
      hover: false,
    });
    setLocalStorageItem('menuCollapsed', !collapsed);
    const { onCollapseChange } = this.props;
    onCollapseChange && onCollapseChange(!collapsed);
  };

  onMouseEnter = (e) => {
    const { collapsed } = this.state;
    if (collapsed) {
      const target = (e && e.target) || null;
      const className = target ? target.className || '' : '';
      if (isString(className) && !className.includes('trigger')) {
        this.setState({
          hover: true,
        });
      }
    }
  };

  onMouseLeave = () => {
    const { hover } = this.state;
    if (hover) {
      this.setState({
        hover: false,
      });
    }
  };

  onClickMenuItem = ({ key }) => {
    const path = getPath({ key });
    const { pathname } = this.props;
    if (pathname !== path) {
      this.routing.push(path);
    }
  };

  // eslint-disable-next-line no-unused-vars
  renderMenuItemIcon = ({ item, collapsed, isSubMenu }) => {
    return item.icon;
  };

  renderMenuItem = (item, isSubMenu) => {
    const { collapsed, hover } = this.state;
    if (collapsed && !hover) {
      return (
        <Menu.Item key={item.key} className={styles['menu-item-collapsed']}>
          {this.renderMenuItemIcon({ item, collapsed, isSubMenu })}
        </Menu.Item>
      );
    }

    if (item.level > 1) {
      return null;
    }
    const { showChildren = true } = item;
    if (
      !showChildren ||
      !item.children ||
      item.children.length === 0 ||
      item.level
    ) {
      return (
        <Menu.Item
          key={item.key}
          className={styles['menu-item']}
          onClick={this.onClickMenuItem}
        >
          <span className={styles['menu-item-title-wrapper']}>
            {/* <Menu.Item key={item.key} className={styles['menu-item-no-child']}> */}
            {this.renderMenuItemIcon({ item, isSubMenu })}
            <span
              className={
                item.level === 0 || (item.level === 1 && !showChildren)
                  ? styles['menu-item-title']
                  : styles['sub-menu-item-title']
              }
            >
              {item.name.length >= this.maxTitleLength ? (
                <Tooltip title={item.name} placement="right">
                  {item.name}
                </Tooltip>
              ) : (
                item.name
              )}
            </span>
          </span>
        </Menu.Item>
      );
    }
    const title = (
      <span className={styles['sub-menu-title']}>
        {this.renderMenuItemIcon({ item })}
        <span className={styles['menu-item-title']}>
          {item.name.length >= this.maxTitleLength ? (
            <Tooltip title={item.name} placement="right">
              {item.name}
            </Tooltip>
          ) : (
            item.name
          )}
        </span>
      </span>
    );
    const subMenuItems = item.children.map((it) =>
      this.renderMenuItem(it, true)
    );

    return (
      <SubMenu key={item.key} title={title} className={styles['sub-menu']}>
        {subMenuItems}
      </SubMenu>
    );
  };

  getFirstLevelKeys = (selectedKeys) => {
    const fathers = this.menu.filter((it) => {
      const { children = [] } = it;
      if (!children.length) {
        return selectedKeys.includes(it.key);
      }
      let hasFather = children.find((c) => selectedKeys.includes(c.key));
      if (hasFather) {
        return true;
      }
      children.forEach((c) => {
        const { children: cc = [] } = c;
        const child = cc.find((ccc) => selectedKeys.includes(ccc.key));
        if (child) {
          hasFather = true;
        }
      });
      return hasFather;
    });
    return fathers.map((f) => f.key);
  };

  getSelectedKeysForMenu = (selectedKeys) => {
    const { collapsed, hover } = this.state;
    if (!collapsed || hover) {
      return selectedKeys;
    }
    return this.getFirstLevelKeys(selectedKeys);
  };

  getCurrentOpenKeys = (selectedKeys) => {
    return this.getFirstLevelKeys(selectedKeys);
  };

  renderMenu = (selectedKeys = []) => {
    const { collapsed } = this.state;
    const { openKeys } = this.rootStore;
    const menuItems = this.menu
      .map((item) => this.renderMenuItem(item))
      .filter((it) => it !== null);

    const newSelectedKeys = this.getSelectedKeysForMenu(selectedKeys);
    return (
      <Menu
        theme={GLOBAL_VARIABLES.menuTheme}
        mode="inline"
        className={collapsed ? styles['menu-collapsed'] : styles.menu}
        defaultSelectedKeys={newSelectedKeys}
        selectedKeys={newSelectedKeys}
        openKeys={openKeys}
        onOpenChange={this.onOpenChange}
      >
        {menuItems}
      </Menu>
    );
  };

  onOpenChange = (openKeys) => {
    const { openKeys: stateOpenKeys } = this.state;
    const { openKeys: defaultOpenKeys } = this.rootStore;
    const oldKeys = Array.from(
      new Set(stateOpenKeys.concat(toJS(defaultOpenKeys)))
    );
    const latestOpenKey = openKeys.find((key) => oldKeys.indexOf(key) === -1);
    const newKeys = latestOpenKey ? [latestOpenKey] : [];
    this.updateOpenKeys(newKeys);
  };

  updateOpenKeys = (keys) => {
    this.rootStore.updateOpenKeys(keys);
    this.setState({
      openKeys: keys,
    });
  };

  getSelectedKeys = (currentRoutes) => {
    if (currentRoutes.length === 0) {
      return [];
    }
    if (currentRoutes.length === 1) {
      return [currentRoutes[0].key];
    }
    if (currentRoutes.length >= 2) {
      return [currentRoutes[1].key];
    }
    return [];
  };

  updateOpenKeysByRoute() {
    const currentOpenKeys = this.getOpenKeysByRoute();
    const { openKeys: defaultOpenKeys } = this.rootStore;
    if (!isEqual(currentOpenKeys, toJS(defaultOpenKeys))) {
      this.init();
    }
  }

  init() {
    const currentOpenKeys = this.getOpenKeysByRoute();
    this.updateOpenKeys(currentOpenKeys);
  }

  renderTrigger() {
    const { collapsed } = this.state;
    // const triggerIcon = <MenuUnfoldOutlined />;
    const triggerIcon = collapsed ? (
      <MenuUnfoldOutlined className={styles['trigger-icon']} />
    ) : (
      <MenuFoldOutlined className={styles['trigger-icon']} />
    );
    return (
      <div className={styles['trigger-wrapper']}>
        <div className={styles.trigger} onClick={this.changeCollapse}>
          {triggerIcon}
        </div>
      </div>
    );
  }

  render() {
    const { currentRoutes } = this.props;
    const selectedKeys = this.getSelectedKeys(currentRoutes);
    const { hover, collapsed } = this.state;
    const trigger = this.renderTrigger();

    return (
      <div
        className={classnames(
          styles['base-layout-sider'],
          collapsed ? styles['base-layout-sider-collapsed'] : '',
          hover ? styles['base-layout-sider-hover'] : ''
        )}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {this.renderMenu(selectedKeys)}
        {trigger}
      </div>
    );
  }
}

export default inject('rootStore')(observer(LayoutMenu));
