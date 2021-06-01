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
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'react-router-dom';
import { Icon } from 'antd';

import styles from './index.less';

export default class NavItem extends React.Component {
  static propTypes = {
    item: PropTypes.object,
    current: PropTypes.string,
    prefix: PropTypes.string,
    onClick: PropTypes.func,
  };

  checkSelect = (item = {}) => {
    const { current } = this.props;

    if (item.children) {
      return item.children.some((child) => this.checkSelect(child));
    }

    if (item.tabs) {
      return item.tabs.some((tab) => this.checkSelect(tab));
    }

    return current.startsWith(item.name);
  };

  render() {
    const { item, prefix, onClick } = this.props;

    if (item.children) {
      return (
        <li
          className={classnames({
            [styles.childSelect]: item.open || this.checkSelect(item),
          })}
        >
          <div className={styles.title}>
            <Icon name={item.icon} /> {t(item.title)}
            <Icon name="chevron-down" className={styles.rightIcon} />
          </div>
          <ul className={styles.innerNav}>
            {item.children.map((child) => (
              <li
                key={child.name}
                className={classnames({
                  [styles.select]: this.checkSelect(child),
                })}
              >
                <Link to={`${prefix}/${child.name}`}>{t(child.title)}</Link>
              </li>
            ))}
          </ul>
        </li>
      );
    }

    return (
      <li
        key={item.name}
        className={classnames({
          [styles.select]: this.checkSelect(item),
        })}
      >
        <Link to={`${prefix}/${item.name}`} onClick={onClick}>
          <Icon name={item.icon} /> {t(item.title)}
        </Link>
      </li>
    );
  }
}
