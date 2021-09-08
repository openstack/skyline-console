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
import { Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import classnames from 'classnames';
import logoSmall from 'src/asset/image/logo-small.svg';
import logoExtend from 'src/asset/image/logo-extend.svg';
import styles from './index.less';

const { SubMenu } = Menu;

export class LayoutMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      hover: false,
      openKeys: [],
    };
  }

  get menu() {
    return this.props.menu || [];
  }

  get isAdminPage() {
    return this.props.isAdminPage || false;
  }

  getUrl(path, adminStr) {
    return this.isAdminPage ? `${path}${adminStr || '-admin'}` : path;
  }

  get rootStore() {
    return this.props.rootStore;
  }

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  };

  getImage(isExtend) {
    return !isExtend ? logoSmall : logoExtend;
  }

  changeCollapse = () => {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
      hover: false,
    });
    const { onCollapseChange } = this.props;
    onCollapseChange && onCollapseChange(!collapsed);
  };

  onMouseEnter = (e) => {
    const { collapsed } = this.state;
    if (collapsed) {
      const target = (e && e.target) || null;
      const className = target ? target.className || '' : '';
      if (className.indexOf('trigger') < 0) {
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

  renderMenuItem = (item) => {
    const { collapsed, hover } = this.state;
    if (collapsed && !hover) {
      return (
        <Menu.Item key={item.key} className={styles['menu-item']}>
          {item.icon}
        </Menu.Item>
      );
    }

    if (item.level > 1) {
      return null;
    }
    if (!item.children || item.children.length === 0 || item.level) {
      return (
        <Menu.Item key={item.key} className={styles['menu-item']}>
          {item.icon}
          <span>
            <Link key={item.key} to={item.path}>
              {item.name}
            </Link>
          </span>
        </Menu.Item>
      );
    }
    const title = (
      <span>
        {item.icon}
        <span>{item.name}</span>
      </span>
    );
    const subMenuItems = item.children.map((it) => this.renderMenuItem(it));

    return (
      <SubMenu key={item.key} title={title} className={styles['sub-menu']}>
        {subMenuItems}
      </SubMenu>
    );
  };

  renderMenu = (selectedKeys = []) => {
    const { openKeys } = this.state;
    const { openKeys: defaultOpenKeys } = this.rootStore;
    const newOpenKeys =
      openKeys.length === 0 ? toJS(defaultOpenKeys) : openKeys;
    const menuItems = this.menu
      .map((item) => this.renderMenuItem(item))
      .filter((it) => it !== null);

    return (
      <Menu
        theme="dark"
        mode="inline"
        className={styles.menu}
        defaultSelectedKeys={selectedKeys}
        selectedKeys={selectedKeys}
        openKeys={newOpenKeys}
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
    this.rootStore.updateOpenKeys(newKeys);
    this.setState({
      openKeys: newKeys,
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

  renderLogo() {
    const { collapsed, hover } = this.state;
    const isExtend = !collapsed || hover;
    const imageSvg = this.getImage(isExtend);
    const homeUrl = this.getUrl('/base/overview');
    return (
      <div
        className={classnames(
          styles.logo,
          !isExtend ? styles['logo-collapse'] : ''
        )}
      >
        <Link to={homeUrl}>
          <img src={imageSvg} alt="logo" className={styles['logo-image']} />
        </Link>
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
        {this.renderLogo()}
        {this.renderMenu(selectedKeys)}
        {trigger}
      </div>
    );
  }
}

export default inject('rootStore')(observer(LayoutMenu));
