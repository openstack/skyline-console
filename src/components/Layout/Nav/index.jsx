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

import { trimEnd } from 'lodash';

import NavItem from './item';

import styles from './index.less';

class Nav extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    navs: PropTypes.array.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    prefix: PropTypes.string,
    // eslint-disable-next-line react/no-unused-prop-types
    checkSelect: PropTypes.func,
    onItemClick: PropTypes.func,
    innerRef: PropTypes.object,
  };

  static defaultProps = {
    className: '',
    prefix: '',
    checkSelect() {},
    onItemClick() {},
  };

  get currentPath() {
    const {
      location: { pathname },
      match: { url },
    } = this.props;

    const { length } = trimEnd(url, '/');
    return pathname.slice(length + 1);
  }

  render() {
    const { className, navs, match, innerRef, onItemClick } = this.props;

    const prefix = trimEnd(match.url, '/');

    return (
      <div ref={innerRef} className={className}>
        {navs.map((nav) => (
          <div key={nav.cate} className={styles.subNav}>
            {nav.title && <p>{t(nav.title)}</p>}
            <ul>
              {nav.items.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  prefix={prefix}
                  current={this.currentPath}
                  onClick={onItemClick}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
}

export default Nav;
