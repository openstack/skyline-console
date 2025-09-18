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
import { Select, Button, Input } from 'antd';
import { PlusCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { isArray, isEqual, isEmpty, isFunction } from 'lodash';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { generateId } from 'utils/index';
import styles from './index.less';

export default class index extends Component {
  static propTypes = {
    minCount: PropTypes.number,
    maxCount: PropTypes.number,
    tips: PropTypes.node,
    options: PropTypes.array,
    placeholder: PropTypes.string,
    defaultItemValue: PropTypes.any,
    addText: PropTypes.string,
    addTextTips: PropTypes.string,
    width: PropTypes.number,
    itemComponent: PropTypes.any,
    optionsByIndex: PropTypes.bool, // special: index=0, use [options[0]]; index=1 use [options[1]]; index >= options.length, options
    initValue: PropTypes.array,
    readonlyKeys: PropTypes.array,
    disableEditKeys: PropTypes.array,
    disabledRemoveFunc: PropTypes.func,
    hideAddButton: PropTypes.bool,
  };

  static defaultProps = {
    minCount: 0,
    maxCount: Infinity,
    addText: t('Add'),
    placeholder: t('Please select'),
    width: 200,
    itemComponent: null,
    optionsByIndex: false,
    initValue: [],
    readonlyKeys: [],
    disableEditKeys: [],
    disabledRemoveFunc: null,
    hideAddButton: false,
  };

  constructor(props) {
    super(props);
    const { initValue = [] } = props;
    this.state = {
      items: this.getInitItems(props),
      initValue,
      keyId: generateId(),
    };
  }

  getInitItems = (props) => {
    const { value, initValue } = props;
    if (!isEmpty(initValue)) {
      return isArray(initValue) ? [...initValue] || [] : [];
    }
    return isArray(value) ? [...value] || [] : [];
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!isEqual(nextProps.initValue, prevState.initValue)) {
      return {
        initValue: nextProps.initValue,
        items: JSON.parse(JSON.stringify(nextProps.initValue)),
        keyId: generateId(),
      };
    }
    return null;
  }

  addItem = () => {
    const { items } = this.state;
    const { maxCount } = this.props;
    if (items.length >= maxCount) {
      return;
    }
    const { defaultItemValue } = this.props;
    const newItem = {
      value: defaultItemValue,
      index: items.length,
    };
    this.updateItems([...items, newItem]);
  };

  updateItems = (newItems) => {
    this.setState(
      {
        items: newItems,
      },
      () => {
        const { onChange } = this.props;
        if (onChange) {
          onChange(newItems);
        }
      }
    );
  };

  // eslint-disable-next-line no-shadow
  canRemove = (index, item) => {
    const isDisabledKey = this.checkItemRemoveDisabled(item);
    const { minCount } = this.props;
    return index >= minCount && !isDisabledKey;
  };

  // eslint-disable-next-line no-shadow
  removeItem = (index) => {
    const { items } = this.state;
    items.splice(index, 1);
    this.updateItems(items);
  };

  // eslint-disable-next-line no-shadow
  onItemChange = (newVal, index) => {
    const { items } = this.state;
    items[index] = {
      value: newVal,
      index,
    };
    this.updateItems(items);
  };

  // eslint-disable-next-line no-shadow
  onItemChangeInput = (newVal, index) => {
    const { items } = this.state;
    items[index] = {
      value: newVal,
      index,
    };
    this.updateItems(items);
  };

  getOptions = (itemIndex) => {
    // special: index=0, use [options[0]]; index=1 use [options[1]]; index >= options.length, options
    const { optionsByIndex, options } = this.props;
    if (!optionsByIndex) {
      return options;
    }
    if (itemIndex < options.length) {
      return [options[itemIndex]];
    }
    return options;
  };

  checkItemRemoveDisabled = (item) => {
    const { items = [] } = this.state;
    const { disabledRemoveFunc } = this.props;
    if (isFunction(disabledRemoveFunc)) {
      return disabledRemoveFunc({ item, items });
    }
    return this.checkDisabledKey(item);
  };

  checkDisabledKey = (item) => {
    const { key = '' } = item.value || {};
    const { disableEditKeys = [] } = this.props;
    const isDisabledKey = disableEditKeys.indexOf(key) >= 0;
    return isDisabledKey;
  };

  renderTip() {
    const { tips } = this.props;
    if (tips) {
      return <div>{tips}</div>;
    }
    return null;
  }

  // eslint-disable-next-line no-shadow
  renderItem = (item, index) => {
    const {
      itemComponent,
      readonlyKeys = [],
      isInput = false,
      placeholder,
      width,
    } = this.props;
    if (!itemComponent) {
      if (isInput) {
        return (
          <Input
            value={item.value}
            placeholder={placeholder || t('Please input')}
            style={{ width }}
            onChange={(e) => {
              this.onItemChange(e.currentTarget.value, index);
            }}
          />
        );
      }
      return (
        <Select
          className={styles.float}
          options={this.getOptions(index)}
          value={item.value}
          placeholder={placeholder}
          style={{ width }}
          onChange={(newValue) => {
            this.onItemChange(newValue, index);
          }}
        />
      );
    }
    const ItemComponent = itemComponent;
    const { key = '' } = item.value || {};
    const keyReadonly = readonlyKeys.indexOf(key) >= 0;
    const isDisabledKey = this.checkItemRemoveDisabled(item);
    return (
      <ItemComponent
        {...this.props}
        name={`name-${index}`}
        value={item.value}
        index={index}
        keyReadonly={keyReadonly}
        disabled={isDisabledKey}
        onChange={(newValue) => {
          this.onItemChange(newValue, index);
        }}
      />
    );
  };

  renderItems() {
    const { items, keyId } = this.state;
    // eslint-disable-next-line no-shadow
    const selects = items.map((it, index) => (
      <div className={styles.item} key={`add-select-item-${keyId}-${index}`}>
        <Button
          type="link"
          onClick={() => this.removeItem(index)}
          className={classnames(styles.float, styles['remove-btn'])}
          disabled={!this.canRemove(index, it)}
        >
          <MinusCircleFilled />
        </Button>
        <div
          className={classnames(
            styles.float,
            styles['item-detail'],
            'item-detail'
          )}
        >
          {this.renderItem(it, index)}
        </div>
      </div>
    ));
    return <div className={styles.items}>{selects}</div>;
  }

  renderAdd() {
    const { maxCount, addText, addTextTips, hideAddButton } = this.props;
    const { items } = this.state;
    let tips = '';
    if (maxCount !== Infinity) {
      tips += t('Can add { number } {name}', {
        number: maxCount - items.length,
        name: addTextTips || '',
      });
    }

    if (hideAddButton) return null;

    return (
      <div>
        <Button
          className={classnames(styles['add-btn'], 'add-btn')}
          type="link"
          onClick={this.addItem}
        >
          <PlusCircleFilled />
          {addText}
        </Button>
        {tips}
      </div>
    );
  }

  render() {
    return (
      <div className={styles['add-select']}>
        {this.renderTip()}
        {this.renderItems()}
        {this.renderAdd()}
      </div>
    );
  }
}
