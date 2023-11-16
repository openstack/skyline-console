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
import { Link } from 'react-router-dom';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { navItemPropType } from '../common';

import styles from './index.less';

export default class Right extends React.Component {
  static propTypes = {
    items: PropTypes.oneOfType([
      PropTypes.arrayOf(navItemPropType),
      PropTypes.array,
    ]),
    onClose: PropTypes.func,
  };

  static defaultProps = {
    items: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      currentItems: props.items || [],
    };
  }

  onInputChange = (e) => {
    const { value } = e.target;
    this.getNavItemsBySearch(value);
  };

  onSearch = (value) => {
    this.getNavItemsBySearch(value);
  };

  getNavItemsBySearch = (search) => {
    const checkWords = (search || '').toLowerCase().trim();
    const { items } = this.props;
    const currentItems = [];
    items.forEach((first) => {
      if (!checkWords) {
        currentItems.push(first);
      } else {
        const { name, children = [] } = first;
        if (name.toLowerCase().includes(checkWords)) {
          currentItems.push(first);
        } else {
          const cItems = children.filter((c) => {
            return c.name.toLowerCase().includes(checkWords);
          });
          if (cItems.length) {
            currentItems.push({
              ...first,
              children: cItems,
            });
          }
        }
      }
    });
    this.setState({
      currentItems,
    });
  };

  renderNavItemChildren = (item) => {
    const { children = [] } = item;
    const currentChildren = children.length ? children : [item];
    const { onClose } = this.props;
    const items = currentChildren.map((it) => {
      const { name, path } = it;
      return (
        <div key={`${name}-${path}`} className={styles['children-item']}>
          <Link onClick={onClose} to={path}>
            <span className={styles['link-name']}>{name}</span>
          </Link>
        </div>
      );
    });
    return items;
  };

  renderNavItem = (item) => {
    const { name = '' } = item || {};

    return (
      <div className={styles['nav-item']} key={item.name}>
        <div className={styles.title}>{name}</div>
        <div classnames={styles.children}>
          {this.renderNavItemChildren(item)}
        </div>
      </div>
    );
  };

  renderSearch() {
    return (
      <div className={styles.search}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={t('Search')}
          allowClear
          onChange={this.onInputChange}
        />
      </div>
    );
  }

  renderNavItems() {
    const { currentItems = [] } = this.state;
    return (
      <div className={styles.right}>{currentItems.map(this.renderNavItem)}</div>
    );
  }

  render() {
    return (
      <div id="global-nav-right">
        {this.renderSearch()}
        {this.renderNavItems()}
      </div>
    );
  }
}
