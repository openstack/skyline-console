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
import PropTypes from 'prop-types';
import { navItemPropType } from '../common';

import styles from './index.less';

export default class Right extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(navItemPropType),
    onClose: PropTypes.func,
  };

  static defaultProps = {
    items: [],
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
      <div className={styles['nav-item']}>
        <div className={styles.title}>{name}</div>
        <div classnames={styles.children}>
          {this.renderNavItemChildren(item)}
        </div>
      </div>
    );
  };

  render() {
    const { items } = this.props;
    if (!items.length) {
      return null;
    }

    return (
      <div className={styles.right} id="global-nav-right">
        {items.map(this.renderNavItem)}
      </div>
    );
  }
}
