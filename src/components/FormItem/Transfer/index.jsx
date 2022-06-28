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
import { Transfer, Table } from 'antd';
import difference from 'lodash/difference';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

// Customize Table Transfer
const TableTransfer = ({
  leftColumns,
  rightColumns,
  pageSize,
  loading,
  onRowLeft,
  onRowRight,
  ...restProps
}) => (
  <Transfer {...restProps} showSelectAll={false}>
    {({
      direction,
      filteredItems,
      onItemSelectAll,
      onItemSelect,
      selectedKeys: listSelectedKeys,
      disabled: listDisabled,
    }) => {
      const columns = direction === 'left' ? leftColumns : rightColumns;
      const currentOnRow = direction === 'left' ? onRowLeft : onRowRight;

      const rowSelection = {
        getCheckboxProps: (item) => ({
          disabled: listDisabled || item.disabled,
        }),
        onSelectAll(selected, selectedRows) {
          const treeSelectedKeys = selectedRows
            .filter((item) => !item.disabled)
            .map(({ key }) => key);
          const diffKeys = selected
            ? difference(treeSelectedKeys, listSelectedKeys)
            : difference(listSelectedKeys, treeSelectedKeys);
          onItemSelectAll(diffKeys, selected);
        },
        onSelect({ key }, selected) {
          onItemSelect(key, selected);
        },
        selectedRowKeys: listSelectedKeys,
      };
      const pagination = {
        pageSize,
      };

      const onRowDefault = ({ key, disabled: itemDisabled }) => ({
        onClick: () => {
          if (itemDisabled || listDisabled) return;
          onItemSelect(key, !listSelectedKeys.includes(key));
        },
      });

      const onRow = currentOnRow || onRowDefault;

      return (
        <Table
          loading={loading}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredItems}
          pagination={pagination}
          size="small"
          style={{ pointerEvents: listDisabled ? 'none' : null }}
          onRow={onRow}
        />
      );
    }}
  </Transfer>
);

export default class Index extends Component {
  static propTypes = {
    titles: PropTypes.array,
    leftTableColumns: PropTypes.array.isRequired,
    rightTableColumns: PropTypes.array.isRequired,
    dataSource: PropTypes.array.isRequired,
    disabled: PropTypes.bool,
    showSearch: PropTypes.bool,
    filterOption: PropTypes.func,
    onChange: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    value: PropTypes.array,
    pageSize: PropTypes.number,
    loading: PropTypes.bool,
    onRowLeft: PropTypes.func,
    onRowRight: PropTypes.func,
  };

  static defaultProps = {
    titles: [t('Optional list'), t('Selected list')],
    disabled: false,
    showSearch: true,
    filterOption: (inputValue, item) => item.name.indexOf(inputValue) !== -1,
    onChange: null,
    value: [],
    pageSize: 5,
    loading: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      targetKeys: [],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { value = [] } = nextProps;
    if (value !== prevState.targetKeys) {
      return {
        targetKeys: value,
      };
    }
    return null;
  }

  componentDidMount() {
    this.getTargetKey();
  }

  getTargetKey = () => {
    const { oriTargetKeys, value } = this.props;
    // this.setState({ targetKeys: oriTargetKeys });
    if (isEmpty(oriTargetKeys) && isEmpty(value)) return;

    const { onChange } = this.props;
    onChange && onChange(oriTargetKeys || value || []);
  };

  onChange = (nextTargetKeys) => {
    this.setState({ targetKeys: nextTargetKeys });
    const { onChange } = this.props;
    onChange && onChange(nextTargetKeys);
  };

  render() {
    const {
      disabled,
      showSearch,
      leftTableColumns,
      rightTableColumns,
      dataSource,
      filterOption,
      titles,
      pageSize,
      loading,
      onRowLeft,
      onRowRight,
    } = this.props;
    const { targetKeys } = this.state;
    return (
      <>
        <TableTransfer
          titles={titles}
          pageSize={pageSize}
          dataSource={dataSource}
          targetKeys={targetKeys}
          disabled={disabled}
          showSearch={showSearch}
          onChange={this.onChange}
          filterOption={filterOption}
          leftColumns={leftTableColumns}
          rightColumns={rightTableColumns}
          loading={loading}
          onRowLeft={onRowLeft}
          onRowRight={onRowRight}
        />
      </>
    );
  }
}
