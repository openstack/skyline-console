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
import { toJS } from 'mobx';
import {
  Transfer,
  Tree,
  Tooltip,
  Table,
  Input,
  Select,
  InputNumber,
} from 'antd';
import { getYesNoList } from 'utils/index';
import { has } from 'lodash';
import EnumSelect from './EnumSelect';

export default class MetadataTransfer extends Component {
  constructor(props) {
    super(props);
    this.state = this.initState(props);
  }

  get metadata() {
    const self = this;
    const { metadata } = this.props;
    return (metadata || []).map((item) => {
      const {
        detail: { properties = {} } = {},
        namespace,
        description,
        display_name,
        isObject,
        objName,
      } = toJS(item);
      const children = Object.keys(properties).map((key) => {
        const value = toJS(properties[key]);
        const newKey = `${namespace}--${key}`;
        const detail = {
          ...value,
          defaultValue: self.getDefaultValue(value, newKey),
        };
        const title = !isObject
          ? `${display_name} > ${value.title}`
          : `${display_name} - ${objName} > ${value.title}`;
        const toolTipTitle = (
          <div>
            <p>{title}</p>
            <p>{value.description}</p>
          </div>
        );
        return {
          key: newKey,
          namespace,
          realKey: key,
          title: <Tooltip title={toolTipTitle}>{value.title}</Tooltip>,
          description: value.description,
          detail,
        };
      });
      const title = isObject ? `${display_name} - ${objName}` : display_name;
      const objectNamespace = isObject ? `${namespace}-${objName}` : null;
      const objectDesc = isObject ? (
        <div>
          <p>{description}</p>
          <p>{item.objDescription}</p>
        </div>
      ) : null;
      return {
        key: objectNamespace || namespace,
        namespace,
        objectNamespace,
        description: objectDesc || description,
        title: <Tooltip title={objectDesc || description}>{title}</Tooltip>,
        children,
      };
    });
  }

  get columns() {
    return [
      {
        dataIndex: 'title',
        title: t('Name'),
      },
      {
        dataIndex: 'detail',
        title: t('Value'),
        render: (value, record) => this.renderInput(record),
      },
    ];
  }

  initState = (props) => {
    const { value, metadata = [] } = props;
    const targetKeys = [];
    const checkedKeys = [];
    const selectedKeysTable = [];
    const values = {};
    Object.keys(value).forEach((key) => {
      const item = metadata.find((it) => {
        const { detail: { properties = {} } = {} } = it;
        return Object.keys(properties).indexOf(key) >= 0;
      });
      if (item) {
        const { namespace } = item;
        const newKey = `${namespace}--${key}`;
        targetKeys.push(newKey);
        values[newKey] = value[key];
      }
    });
    return {
      checkedKeys,
      targetKeys,
      values,
      selectedKeysTable,
    };
  };

  onValuesChange = (values) => {
    const { onChange } = this.props;
    const newValues = {};
    Object.keys(values).forEach((key) => {
      const realKey = key.split('--')[1];
      newValues[realKey] = String(values[key]);
    });
    onChange && onChange(newValues);
  };

  onInputChange = (value, record) => {
    const { key } = record;
    const { values = {} } = this.state;
    const currentValue = value.target ? value.target.value : value;
    values[key] = currentValue;
    this.setState({
      values,
    });
    this.onValuesChange(values);
  };

  renderInput = (record) => {
    const {
      type,
      defaultValue,
      operators,
      enum: enums = [],
      minimum,
      maximum,
      items = {},
    } = (record && record.detail) || {};
    if (type === 'boolean') {
      const options = getYesNoList();
      return (
        <Select
          options={options}
          defaultValue={defaultValue}
          onChange={(value) => this.onInputChange(value, record)}
          placeholder={t('Please select')}
        />
      );
    }
    if (
      type === 'integer' ||
      type === 'number' ||
      (type === 'string' && enums.length === 0)
    ) {
      const props = {
        defaultValue,
        onChange: (value) => this.onInputChange(value, record),
        placeholder: t('Please input'),
        required: true,
      };
      if (minimum !== undefined) {
        props.minimum = minimum;
      }
      if (maximum !== undefined) {
        props.maximum = maximum;
      }
      if (type === 'string') {
        return <Input {...props} />;
      }
      if (type === 'integer') {
        props.precision = 0;
        props.formatter = (value) => `$ ${value}`.replace(/\D/g, '');
      }
      return <InputNumber {...props} />;
    }
    // if (enums.length > 0 && operators.length === 1 && operators[0] === '<or>') {
    if (enums.length > 0) {
      const options = enums.map((it) => ({
        value: it,
        label: it,
      }));
      return (
        <Select
          options={options}
          defaultValue={defaultValue}
          onChange={(value) => this.onInputChange(value, record)}
          placeholder={t('Please select')}
        />
      );
    }
    if (items.enum) {
      const props = {
        defaultValue,
        items,
        operators,
        onChange: (value) => this.onInputChange(value, record),
      };
      return <EnumSelect {...props} />;
    }
    return null;
  };

  flatten = (aList = [], data = []) => {
    aList.forEach((item) => {
      const { children = [] } = item;
      data.push(item);
      this.flatten(children, data);
    });
  };

  getTreeData = () => {
    const data = [];
    this.flatten(this.metadata, data);
    return data;
  };

  getTreeDataWithoutFather = () => {
    const data = [];
    this.flatten(this.metadata, data);
    return data.filter((it) => it.key.indexOf('--') >= 0);
  };

  getAllTreeKeys = () => {
    const treeData = this.getTreeData();
    return treeData.map((it) => it.key);
  };

  generateTree = (treeNodes = [], checkedKeys = []) =>
    treeNodes.map(({ children, ...props }) => ({
      ...props,
      disabled: checkedKeys.includes(props.key),
      children: this.generateTree(children, checkedKeys),
    }));

  isChecked = (selectedKeys, eventKey) => selectedKeys.indexOf(eventKey) !== -1;

  isChildKey = (key) => key.indexOf('--') >= 0;

  onCheckTree = (onItemSelect) => {
    return (checkedKeysTree) => {
      const allTreeKeys = this.getAllTreeKeys();
      allTreeKeys.forEach((treeKey) => {
        const checked = checkedKeysTree.indexOf(treeKey) >= 0;
        if (this.isChildKey(treeKey)) {
          onItemSelect(treeKey, checked);
        }
      });
      this.setState({
        checkedKeys: checkedKeysTree,
      });
    };
  };

  renderTree = ({ onItemSelect, targetKeys }) => {
    const { checkedKeys } = this.state;
    return (
      <Tree
        blockNode
        checkable
        checkedKeys={checkedKeys}
        treeData={this.generateTree(this.metadata, targetKeys)}
        onCheck={this.onCheckTree(onItemSelect)}
      />
    );
  };

  renderTable = ({
    filteredItems,
    onItemSelectAll,
    onItemSelect,
    disabled: listDisabled,
  }) => {
    const { selectedKeysTable } = this.state;
    const self = this;
    const rowSelection = {
      getCheckboxProps: (item) => ({ disabled: listDisabled || item.disabled }),
      onSelectAll(selected, selectedRows) {
        const selectedRowKeys = selected
          ? selectedRows.map((row) => row.key)
          : [];
        if (selected) {
          onItemSelectAll(selectedRowKeys, selected);
        } else {
          onItemSelectAll(selectedKeysTable, selected);
        }
        self.setState({
          selectedKeysTable: selectedRowKeys,
        });
      },
      onSelect({ key }, selected) {
        onItemSelect(key, selected);
        let newSelectedKeysTable = [];
        if (selected) {
          newSelectedKeysTable = [...selectedKeysTable, key];
        } else {
          newSelectedKeysTable = selectedKeysTable.filter((it) => it !== key);
        }
        self.setState({
          selectedKeysTable: newSelectedKeysTable,
        });
      },
      selectedRowKeys: selectedKeysTable,
    };
    return (
      <Table
        rowSelection={rowSelection}
        columns={this.columns}
        dataSource={filteredItems}
        size="small"
        pagination={false}
        style={{ pointerEvents: listDisabled ? 'none' : null }}
      />
    );
  };

  getChildKeys = (namespace) => {
    const keys = [];
    this.metadata.forEach((item) => {
      (item.children || []).forEach((child) => {
        if (child.namespace === namespace) {
          keys.push(child.key);
        }
      });
    });
    return keys;
  };

  getDefaultValue = (prop, key) => {
    const {
      type,
      default: originDefault,
      defaultValue,
      operators,
      enum: enums = [],
      minimum,
      items = {},
    } = prop || {};
    const { values } = this.state;
    if (has(values, key)) {
      return values[key];
    }
    if (originDefault) {
      return originDefault;
    }
    if (defaultValue) {
      return defaultValue;
    }
    if (type === 'boolean') {
      return true;
    }
    if (type === 'string' && enums.length === 0) {
      return defaultValue;
    }
    if (type === 'string' && enums.length > 0) {
      return defaultValue || enums[0];
    }
    if (type === 'integer' || type === 'number') {
      return defaultValue || minimum || 0;
    }
    if (enums.length > 0) {
      return enums[0];
      // if (operators && operators.length === 1 && operators[0] === '<or>') {
      //   return enums[0];
      // } else {
      //   return enums[0];
      // }
    }
    if (items.enum) {
      return operators[0];
    }
    return null;
  };

  getItemDefaultValue = (key) => {
    const tmp = key.split('--');
    if (tmp.length < 1) {
      return;
    }
    const namespace = tmp[0];
    const realKey = tmp[1];
    const father = this.metadata.find((it) => it.key === namespace);
    if (!father) {
      return;
    }
    const item = father.children.find((it) => it.realKey === realKey);
    if (!item) {
      return;
    }
    return this.getDefaultValue(item.detail || {}, key);
  };

  onTransferChange = (keys, direction, moveKeys) => {
    const filterKeys = [];
    keys.forEach((key) => {
      const tmp = key.split('--');
      if (tmp.length > 1) {
        filterKeys.push(key);
      } else {
        const childrenKeys = this.getChildKeys(key);
        filterKeys.push(...childrenKeys);
      }
    });
    const realKeys = Array.from(new Set(filterKeys));
    const { values = {} } = this.state;
    const newValues = {};
    realKeys.forEach((key) => {
      if (values[key]) {
        newValues[key] = values[key];
      } else {
        newValues[key] = this.getItemDefaultValue(key);
      }
    });
    const { selectedKeysTable } = this.state;
    const newSelectedKeysTable =
      direction === 'right'
        ? [...selectedKeysTable, ...realKeys]
        : selectedKeysTable.filter((it) => moveKeys.indexOf(it) < 0);
    const checkedKeys = direction === 'right' ? [] : moveKeys;
    this.setState({
      targetKeys: realKeys,
      values: newValues,
      selectedKeysTable: newSelectedKeysTable,
      checkedKeys,
    });
    this.onValuesChange(newValues);
  };

  onTransferSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({
      checkedKeys: sourceSelectedKeys,
      selectedKeysTable: targetSelectedKeys,
    });
  };

  getTransferSelectedKeys = () => {
    const { checkedKeys = [], selectedKeysTable = [] } = this.state;
    const checkedKeysChild = checkedKeys.filter((it) => this.isChildKey(it));
    return Array.from(new Set([...checkedKeysChild, ...selectedKeysTable]));
  };

  renderTransferItem = (item) => (
    <Tooltip title={item.description}>
      {item.title || item.display_name}
    </Tooltip>
  );

  render() {
    const { targetKeys } = this.state;
    const dataSource = this.getTreeDataWithoutFather();
    const selectedKeysTransfer = this.getTransferSelectedKeys();
    return (
      <Transfer
        onChange={this.onTransferChange}
        onSelectChange={this.onTransferSelectChange}
        targetKeys={targetKeys}
        selectedKeys={selectedKeysTransfer}
        dataSource={dataSource}
        className="tree-transfer"
        render={this.renderTransferItem}
        showSelectAll={false}
      >
        {({
          direction,
          onItemSelect,
          onItemSelectAll,
          filteredItems,
          disabled,
        }) => {
          if (direction === 'left') {
            return this.renderTree({ onItemSelect, dataSource, targetKeys });
          }
          if (direction === 'right') {
            return this.renderTable({
              filteredItems,
              onItemSelectAll,
              onItemSelect,
              disabled,
            });
          }
        }}
      </Transfer>
    );
  }
}
