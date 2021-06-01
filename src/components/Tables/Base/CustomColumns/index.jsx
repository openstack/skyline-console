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
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { includes, remove, isUndefined } from 'lodash';

import styles from './index.less';

class CustomRow extends Component {
  static propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    title: PropTypes.node,
    options: PropTypes.array.isRequired,
  };

  static defaultProps = {
    value: [],
  };

  changeVisibleList = (e) => {
    const value = e.key;
    const { value: visibleList, onChange } = this.props;
    const [...duplicate] = visibleList;
    includes(duplicate, value)
      ? remove(duplicate, (visibleValue) => visibleValue === value)
      : duplicate.push(value);
    onChange(duplicate);
  };

  isVisibleOption(option) {
    const { value } = option;
    const { value: visibleList } = this.props;
    return includes(visibleList, value);
  }

  renderHeader() {
    const { title } = this.props;
    return isUndefined(title) ? null : <header>{title}</header>;
  }

  renderOptions() {
    const { options } = this.props;
    const menuItems = options.map((it) => this.renderOption(it));
    return (
      <Menu onClick={this.changeVisibleList} theme="light">
        {menuItems}
      </Menu>
    );
  }

  renderOption(option) {
    const isVisible = this.isVisibleOption(option);
    const { value, label } = option;
    const icon = isVisible ? (
      <CheckOutlined />
    ) : (
      <span className={styles.empty} />
    );
    return (
      <Menu.Item key={value}>
        {icon}
        {label}
      </Menu.Item>
    );
  }

  render() {
    const { className } = this.props;
    return (
      // <div className={classnames(styles.wrapper, className)}>
      <div className={className}>
        {this.renderHeader()}
        {this.renderOptions()}
      </div>
    );
  }
}

export default CustomRow;
