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
import classnames from 'classnames';
import { Pagination } from 'antd';
import styles from './index.less';

export default class CubePagination extends Component {
  static propTypes() {
    return {
      total: PropTypes.number,
      currentDataSize: PropTypes.number.isRequired,
      current: PropTypes.number.isRequired,
      pageSize: PropTypes.number.isRequired,
      defaultCurrent: PropTypes.number,
      defaultPageSize: PropTypes.number,
      pageSizeOptions: PropTypes.array,
      onChange: PropTypes.func,
      isLoading: PropTypes.bool,
      className: PropTypes.object,
    };
  }

  static defaultProps = {
    isLoading: false,
    total: undefined,
    defaultCurrent: 1,
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    onChange: (page, pageSize) => {
      // eslint-disable-next-line no-console
      console.log(page, pageSize);
    },
  };

  constructor(props) {
    super(props);
    const {
      current,
      pageSize,
      defaultCurrent,
      defaultPageSize,
      currentDataSize,
      isLoading,
      total,
    } = props;
    this.state = {
      current: current || defaultCurrent,
      pageSize: pageSize || defaultPageSize,
      currentDataSize,
      isLoading,
      total,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.currentDataSize !== prevState.currentDataSize ||
      (nextProps.current && nextProps.current !== prevState.current) ||
      nextProps.isLoading !== prevState.isLoading ||
      nextProps.total !== prevState.total
    ) {
      const { currentDataSize, current = 1, isLoading, total } = nextProps;
      return {
        currentDataSize,
        current,
        isLoading,
        total,
      };
    }
    return null;
  }

  handelPageChange = (pageNumber, pageSize) => {
    const { onChange } = this.props;
    onChange && onChange(pageNumber, pageSize);
  };

  onPageChange = (pageNumber) => {
    const { pageSize } = this.state;
    if (pageNumber === this.state.current) {
      // Check for equality because this function will be called on show size change
      // by the design of antd Pagination.
      return;
    }
    this.setState(
      {
        current: pageNumber,
      },
      () => {
        this.handelPageChange(pageNumber, pageSize);
      }
    );
  };

  onShowSizeChange = (current, pageSize) => {
    this.setState(
      {
        pageSize,
      },
      () => {
        this.handelPageChange(1, pageSize);
      }
    );
  };

  onFocusChange = (value) => {
    const { onFocusChange } = this.props;
    onFocusChange && onFocusChange(value);
  };

  onFocus = () => {
    this.onFocusChange(true);
  };

  onBlur = () => {
    this.onFocusChange(false);
  };

  calculateTotalNumber = () => {
    const { current, currentDataSize, pageSize, total } = this.state;

    if (total !== undefined) return total;

    if (currentDataSize < pageSize)
      return (current - 1) * pageSize + currentDataSize;

    return 0;
  };

  render() {
    const { current, currentDataSize } = this.state;

    const { pageSizeOptions, defaultPageSize, className } = this.props;

    const totalNumber = this.calculateTotalNumber();

    return (
      <div
        className={classnames(styles['cube-pagination-container'], className)}
      >
        <Pagination
          size="small"
          current={current}
          onChange={this.onPageChange}
          showQuickJumper
          total={totalNumber}
          showTotal={(total) => `Total ${total} items`}
          showSizeChanger
          currentDataSize={currentDataSize || defaultPageSize}
          pageSizeOptions={pageSizeOptions}
          onShowSizeChange={this.onShowSizeChange}
          disabled={totalNumber === 0}
        />
      </div>
    );
  }
}
