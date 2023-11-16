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
import { observer } from 'mobx-react';
import { CloseOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { Drawer } from 'antd';
import menuIcon from 'asset/image/global-menu.png';
import { navItemPropType } from './common';
import Left from './Left';
import Right from './Right';

import styles from './index.less';

export class GlobalNav extends React.Component {
  static propTypes = {
    navItems: PropTypes.oneOfType([
      PropTypes.arrayOf(navItemPropType),
      PropTypes.array,
    ]),
  };

  static defaultProps = {
    navItems: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  onClose = () => {
    this.setState({ visible: false });
  };

  onToggleOpen = () => {
    this.setState(({ visible }) => {
      return {
        visible: !visible,
      };
    });
  };

  render() {
    const { visible } = this.state;
    const { navItems = [] } = this.props;

    const drawerStyle = {
      top: globalCSS.headerHeight,
      height: `calc(100% - ${globalCSS.headerHeight})`,
    };

    const productsColumnWidth = Number(
      globalCSS.productsColumnWidth.replace('px', '')
    );

    return (
      <>
        <div className={styles['global-nav-icon']} onClick={this.onToggleOpen}>
          <img
            src={menuIcon}
            alt="menu-icon"
            className={styles['global-nav-icon-icon']}
          />
        </div>
        <Drawer
          title={t('Service List')}
          className={styles['drawer-left']}
          placement="left"
          closable={false}
          onClose={this.onClose}
          visible={visible}
          style={drawerStyle}
          bodyStyle={{ padding: 0 }}
          width={productsColumnWidth}
          destroyOnClose
        >
          <Left items={navItems} onClose={this.onClose} />
        </Drawer>
        <Drawer
          title={null}
          className={styles['drawer-right']}
          placement="left"
          closable
          onClose={this.onClose}
          visible={visible}
          style={{
            ...drawerStyle,
            left: visible ? globalCSS.productsColumnWidth : 0,
          }}
          bodyStyle={{ padding: 0 }}
          mask
          width={productsColumnWidth * 4}
          maskStyle={{ backgroundColor: 'transparent' }}
          closeIcon={<CloseOutlined style={{ fontSize: '20px' }} />}
        >
          <div className={styles.main}>
            <Right items={navItems} onClose={this.onClose} />
          </div>
        </Drawer>
      </>
    );
  }
}

export default observer(GlobalNav);
