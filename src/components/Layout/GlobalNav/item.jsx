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

    return current.startsWith(item.name);
  };

  renderIcon(icon) {
    return <Icon name={icon} />;
  }

  render() {
    const { item, prefix, onClick } = this.props;

    return (
      <li
        key={item.name}
        className={classnames({
          [styles.select]: this.checkSelect(item),
        })}
      >
        <Link to={`${prefix}/${item.name}`} onClick={onClick}>
          {this.renderIcon(item.icon)} {t(item.title)}
        </Link>
      </li>
    );
  }
}
