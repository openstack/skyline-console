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
import { navItemPropType, getFirstLevelNavItemLink } from '../common';
// import { pickFixedParams } from 'utils';
import styles from './index.less';

export default class Left extends React.Component {
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

  renderItem = (item) => {
    return (
      <div className={styles.item} key={item.path}>
        <Link
          onClick={this.props.onClose}
          to={getFirstLevelNavItemLink(item)}
          className={styles['item-label']}
        >
          {item.name}
        </Link>
      </div>
    );
  };

  render() {
    const { items } = this.props;
    return (
      <div id="global-nav-left" className={styles.left}>
        {items.map(this.renderItem)}
      </div>
    );
  }
}
