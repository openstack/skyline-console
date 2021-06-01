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
import classNames from 'classnames';

import { Icon, Dropdown, Spin, Menu } from 'antd';

import styles from './index.less';

export default class Selector extends React.Component {
  static propTypes = {
    icon: PropTypes.string,
    defaultIcon: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
    loading: PropTypes.bool,
    options: PropTypes.array,
    onSelect: PropTypes.func,
    onScrollBottom: PropTypes.func,
  };

  static defaultProps = {
    icon: '',
    defaultIcon: '',
    value: '',
    type: '',
    loading: false,
    options: [],
    onSelect() {},
    onScrollBottom() {},
  };

  constructor(props) {
    super(props);

    this.contentRef = React.createRef();
  }

  componentDidMount() {
    if (this.contentRef.current) {
      this.$dropdownContent =
        this.contentRef.current.querySelector('.dropdown-content');
      this.$dropdownContent.addEventListener('scroll', this.handleScroll);
    }
  }

  componentDidUpdate() {
    if (this.contentRef.current) {
      const $menu = this.contentRef.current.querySelector(
        '.dropdown-content > .menu-wrapper'
      );

      if ($menu && this.$dropdownContent) {
        this.threshold =
          $menu.offsetHeight - this.$dropdownContent.offsetHeight;
      }
    }
  }

  componentWillUnmount() {
    if (this.$dropdownContent) {
      this.$dropdownContent.removeEventListener('scroll', this.handleScroll);
    }
  }

  get isMulti() {
    return this.props.options.length > 1;
  }

  handleScroll = (e) => {
    if (this.threshold && e.target.scrollTop >= this.threshold - 2) {
      this.props.onScrollBottom();
    }
  };

  handleMenuClick = (e, key) => {
    this.props.onSelect(key);
  };

  renderList() {
    const { defaultIcon, options, loading } = this.props;

    if (!this.isMulti) {
      return null;
    }

    return (
      <div className="menu-wrapper">
        <Menu width={220} onClick={this.handleMenuClick}>
          {options.map((option) => (
            <Menu.MenuItem key={option.value}>
              <img src={defaultIcon} alt="" />
              {option.label}
            </Menu.MenuItem>
          ))}
        </Menu>
        <div className={styles.bottom}>
          {loading && <Spin size="small" spinning={loading} />}
        </div>
      </div>
    );
  }

  render() {
    const { icon, defaultIcon, value, type, options } = this.props;

    const option = options.find((item) => item.value === value) || {};

    return (
      <div ref={this.contentRef}>
        <Dropdown
          className={classNames('dropdown-default', styles.dropdown)}
          content={this.renderList()}
        >
          <div
            className={classNames(styles.titleWrapper, {
              [styles.multi]: this.isMulti,
            })}
          >
            <div className={styles.icon}>
              <img src={icon || defaultIcon} alt="" />
            </div>
            <div className={styles.text}>
              <p>{type}</p>
              <div className="h6">{option.label || value}</div>
            </div>
            {this.isMulti && (
              <div className={styles.arrow}>
                <Icon name="caret-down" type="light" />
              </div>
            )}
          </div>
        </Dropdown>
      </div>
    );
  }
}
