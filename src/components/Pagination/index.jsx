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
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import classnames from 'classnames';
import styles from './index.less';

export default class index extends Component {
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

  onChange = (current, pageSize) => {
    const { onChange } = this.props;
    onChange && onChange(current, pageSize);
  };

  onChangePageSize = (pageSize) => {
    this.setState(
      {
        pageSize,
      },
      () => {
        this.onChange(1, pageSize);
      }
    );
  };

  onClickPre = () => {
    const { current, pageSize } = this.state;
    if (current === 1) {
      return;
    }
    this.setState(
      {
        current: current - 1,
      },
      () => {
        this.onChange(current - 1, pageSize);
      }
    );
  };

  onClickNext = () => {
    const { current, pageSize, currentDataSize } = this.state;
    if (currentDataSize < pageSize) {
      return;
    }
    this.setState({
      current: current + 1,
    });
    this.onChange(current + 1, pageSize);
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

  checkNextByTotal() {
    const { pageSize, total, current } = this.state;
    if (total === undefined) {
      return true;
    }
    if (!total) {
      return false;
    }
    return current < Math.ceil(total / pageSize);
  }

  renderTotal() {
    const { hideTotal } = this.props;
    if (hideTotal) {
      return null;
    }
    const { current, currentDataSize, pageSize, isLoading, total } = this.state;
    if (total !== undefined) {
      return <span>{t('Total {total} items', { total })}</span>;
    }
    if (isLoading) {
      return null;
    }
    if (currentDataSize < pageSize) {
      const totalCompute = (current - 1) * pageSize + currentDataSize;
      return <span>{t('Total {total} items', { total: totalCompute })}</span>;
    }
    return null;
  }

  renderPageSelect() {
    const { pageSizeOptions, defaultPageSize } = this.props;
    const { pageSize } = this.state;
    const options = pageSizeOptions.map((it) => ({
      label: t('{pageSize} items/page', { pageSize: it }),
      value: it,
    }));
    return (
      <Select
        className={styles['page-select']}
        options={options}
        value={pageSize}
        defaultValue={defaultPageSize}
        // style={{ width }}
        onChange={(newValue) => {
          this.onChangePageSize(newValue);
        }}
      />
    );
  }

  render() {
    const { current, currentDataSize, pageSize, isLoading } = this.state;
    const { className } = this.props;

    const preDisabled = isLoading || current === 1;
    const nextDisabled =
      isLoading || currentDataSize < pageSize || !this.checkNextByTotal();
    return (
      <div
        className={classnames(styles.wrapper, className, 'backend-pagination')}
      >
        <div className={classnames(styles.inner, 'pagination-inner')}>
          {/* <div className={styles.inner} onMouseEnter={this.onFocus} onMouseLeave={this.onBlur}></div> */}
          {this.renderTotal()}
          <Button
            type="link"
            icon={<LeftOutlined />}
            disabled={preDisabled}
            onClick={this.onClickPre}
          />
          <Button type="link" style={{ paddingLeft: 0, paddingRight: 0 }}>
            {current}
          </Button>
          <Button
            type="link"
            icon={<RightOutlined />}
            disabled={nextDisabled}
            onClick={this.onClickNext}
          />
          {this.renderPageSelect()}
        </div>
      </div>
    );
  }
}
