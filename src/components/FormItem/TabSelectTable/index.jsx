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
import SelectTable, {
  renderClearButton,
} from 'components/FormItem/SelectTable';
import { Tabs, Tag } from 'antd';
import { isEmpty } from 'lodash';

export default class TabSelectTable extends Component {
  constructor(props) {
    super(props);

    const { tabs = [], defaultTab, value = {} } = props;
    this.state = {
      tabKey: value.tab || defaultTab || (tabs[0] && tabs[0].key),
      selectedRowKeys: value.selectedRowKeys || [],
      selectedRows: value.selectedRows || [],
    };
    this.init(props);
  }

  handleChangeTab = (tabKey) => {
    this.setState({
      tabKey,
    });
  };

  onChangeValue = () => {
    const { onChange } = this.props;
    onChange && onChange(this.state);
  };

  getMultiSelected = (keys, rows, data) => {
    const { selectedRowKeys: keysInState, selectedRows: rowsInState } =
      this.state;
    const addKeys = keys.filter((key) => keysInState.indexOf(key) < 0);
    const addRows = rows.filter(
      (row) => addKeys.indexOf(row.key) >= 0 || addKeys.indexOf(row.id) >= 0
    );
    const removeKeys = keysInState.filter((key) => {
      const notInKeys = keys.indexOf(key) < 0;
      if (!notInKeys) {
        return false;
      }
      const item = data.find((it) => it.key === key || it.id === key);
      return !!item;
    });
    const newKeys = [...keysInState, ...addKeys].filter(
      (key) => removeKeys.indexOf(key) < 0
    );
    const newRows = [...rowsInState, ...addRows].filter((row) => {
      const rowKey = row.key || row.id;
      return removeKeys.indexOf(rowKey) < 0;
    });
    return [newKeys, newRows];
  };

  onSelectTableChange = (value) => {
    const { selectedRowKeys, selectedRows, data } = value;
    const { isMulti = false } = this.props;
    const [newKeys, newRows] = isMulti
      ? this.getMultiSelected(selectedRowKeys, selectedRows, data)
      : [selectedRowKeys, selectedRows];
    const newState = {
      selectedRowKeys: newKeys,
      selectedRows: newRows,
    };
    this.setState(newState, () => {
      this.onChangeValue();
    });
  };

  clearSelected = () => {
    this.setState(
      {
        selectedRowKeys: [],
        selectedRows: [],
      },
      () => {
        this.onChangeValue();
      }
    );
  };

  onTagClose = (itemKey) => {
    const { selectedRowKeys, selectedRows } = this.state;
    const newKeys = selectedRowKeys.filter((it) => it !== itemKey);
    const newRows = selectedRows.filter(
      (it) => it.key !== itemKey && it.id !== itemKey
    );
    this.setState(
      {
        selectedRowKeys: newKeys,
        selectedRows: newRows,
      },
      () => {
        this.onChangeValue();
      }
    );
  };

  init(props) {
    const { value = {} } = props;
    if (!isEmpty(value)) {
      this.onChangeValue();
    }
  }

  renderTabSelectTable(tabItem) {
    const { selectedRowKeys, selectedRows } = this.state;
    const value = { selectedRowKeys };
    const initValue = {
      selectedRowKeys,
      selectedRows,
    };
    return (
      <SelectTable
        {...tabItem.props}
        onChange={this.onSelectTableChange}
        showSelected={false}
        value={value}
        initValue={initValue}
      />
    );
  }

  renderTab(tabItem) {
    const { tabKey } = this.state;
    if (tabKey !== tabItem.key) {
      return <Tabs.TabPane tab={tabItem.title} key={tabItem.key} />;
    }
    return (
      <Tabs.TabPane tab={tabItem.title} key={tabItem.key}>
        {this.renderTabSelectTable(tabItem)}
      </Tabs.TabPane>
    );
  }

  renderTabs() {
    const { tabKey } = this.state;
    const { tabs } = this.props;
    if (!tabKey) {
      return null;
    }
    if (tabs.length === 1) {
      return this.renderTabSelectTable(tabs[0]);
    }
    const tabPanes = tabs.map((it) => this.renderTab(it));
    return (
      <Tabs activeKey={tabKey} onChange={this.handleChangeTab}>
        {tabPanes}
      </Tabs>
    );
  }

  renderTag = (item) => (
    <Tag
      key={item.key || item.id}
      closable
      onClose={() => this.onTagClose(item.key || item.id)}
    >
      {this.props.tagKey ? item[this.props.tagKey] : item.name}
    </Tag>
  );

  renderClearButton = (rows) => {
    return renderClearButton(this, rows);
  };

  renderSelected() {
    const { selectedRows } = this.state;
    const items = selectedRows.map((it) => this.renderTag(it));
    const clearButton = this.renderClearButton(selectedRows);
    return (
      <div>
        {t('Selected')} :&nbsp;&nbsp;{clearButton}&nbsp;&nbsp;{items}
      </div>
    );
  }

  renderHeader() {
    const { header } = this.props;
    return header || null;
  }

  render() {
    return (
      <>
        {this.renderHeader()}
        {this.renderTabs()}
        {this.renderSelected()}
      </>
    );
  }
}
