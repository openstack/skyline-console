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

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Input, Tag, Menu, Divider, Button, Checkbox, Row, Col } from 'antd';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { isEmpty, isBoolean } from 'lodash';
import styles from './index.less';

const option = PropTypes.shape({
  label: PropTypes.string.isRequired,
  key: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.bool.isRequired,
  ]),
  component: PropTypes.node,
});

const filterParam = PropTypes.shape({
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  isSingle: PropTypes.bool,
  isServer: PropTypes.bool,
  allowed: PropTypes.func,
  options: PropTypes.arrayOf(option),
  isTime: PropTypes.bool,
});

const getCheckOptionValue = (name, key) => {
  return `${name}--${key}`;
};

const getCheckValueInfo = (value = '') => {
  const name = value.split('--')[0];
  const key = value.split('--')[1];
  return {
    name,
    key,
  };
};

export const getTags = (initValue, filterParams) => {
  if (!initValue || isEmpty(initValue)) {
    return {};
  }
  if (isEmpty(filterParams)) {
    return {};
  }
  const tags = [];
  const checkValues = [];
  Object.keys(initValue).forEach((key) => {
    const item = filterParams.find((it) => it.name === key);
    if (item) {
      const { options = [] } = item;
      const value = initValue[key];
      if (options.length) {
        const optionItem = options.find((op) => op.key === value);
        if (optionItem && optionItem.isQuick) {
          checkValues.push(getCheckOptionValue(item.name, value));
        }
      }
      tags.push({
        value,
        filter: item,
      });
    }
  });
  return {
    tags,
    checkValues,
  };
};

class MagicInput extends PureComponent {
  static propTypes = {
    filterParams: PropTypes.arrayOf(filterParam),
    // eslint-disable-next-line react/no-unused-prop-types
    initValue: PropTypes.object,
    placeholder: PropTypes.string,
    onInputChange: PropTypes.func,
    onInputFocus: PropTypes.func,
  };

  static defaultProps = {
    filterParams: [],
    initValue: {},
    placeholder: t('Click here for filters.'),
  };

  constructor(props) {
    super(props);

    this.inputRef = React.createRef();

    this.state = {
      tags: [],
      currentFilter: null,
      isFocus: false,
      optionClear: false,
      checkValues: [],
    };
  }

  componentDidMount() {
    this.initTags(this.props);
  }

  getFilterParams = () => {
    // eslint-disable-next-line no-shadow
    const { filterParams } = this.props;
    const { tags } = this.state;
    const filters = [];
    filterParams.forEach((item) => {
      const alreadyTag = tags.find((it) => it.filter.name === item.name);
      if (!alreadyTag) {
        filters.push(item);
      }
    });
    return filters;
  };

  onTagsChange = () => {
    const { onInputChange } = this.props;
    const { tags } = this.state;
    onInputChange && onInputChange(tags);
  };

  onFocusChange = (value) => {
    const { onInputFocus } = this.props;
    onInputFocus && onInputFocus(value);
  };

  getDefaultFilter = () => {
    const { filterParams } = this.props;
    return filterParams.find((it) => !it.options);
  };

  handleEnter = (e) => {
    e && e.preventDefault();
    e && e.stopPropagation();
    const { value } = e.currentTarget;
    if (!value) {
      return;
    }
    this.updateInput(value);
  };

  handleBlur = () => {
    const { currentFilter } = this.state;
    if (currentFilter) {
      this.setState({
        isFocus: true,
      });
      this.onFocusChange(true);
    } else {
      this.onFocusChange(false);
    }
  };

  handleKeyUp = (e) => {
    if (e.keyCode === 8 || e.keyCode === 46) {
      const { currentFilter, tags } = this.state;
      const { value } = this.inputRef.current.state;
      if (currentFilter && isEmpty(value)) {
        this.setState({
          currentFilter: null,
        });
      } else if (tags.length > 0 && isEmpty(value)) {
        this.handleTagClose(tags[tags.length - 1].filter.name);
      }
    }
  };

  handleFocus = () => {
    this.setState({
      isFocus: true,
    });
    this.onFocusChange(true);
  };

  handleInputChange = (e) => {
    this.setState({
      inputValue: e.target.value,
    });
  };

  handleTagClose = (name) => {
    const { tags, checkValues } = this.state;
    const newTags = tags.filter((it) => it.filter.name !== name);
    const leftCheckValues = checkValues.filter(
      (it) => getCheckValueInfo(it).name !== name
    );
    this.setState(
      {
        tags: newTags,
        optionClear: false,
        checkValues: leftCheckValues,
      },
      () => {
        this.onTagsChange();
      }
    );
  };

  handleOptionClick = ({ key }) => {
    let value;
    if (key === 'true') {
      value = true;
    } else {
      value = key === 'false' ? false : key;
    }
    this.updateInput(value);
    this.onFocusChange(false);
  };

  handleSelectFilter = ({ key }) => {
    // eslint-disable-next-line no-shadow
    const { filterParams } = this.props;
    const filter = filterParams.find((it) => it.name === key);
    this.setState(
      {
        currentFilter: filter,
        isFocus: true,
      },
      () => {
        this.inputRef.current.focus();
        this.onFocusChange(true);
      }
    );
  };

  initTags(props) {
    const { initValue, filterParams } = props;
    const { tags = [], checkValues } = getTags(initValue, filterParams);
    if (!tags.length) {
      return;
    }
    this.setState(
      {
        tags,
        checkValues,
      },
      () => {
        this.onTagsChange();
      }
    );
  }

  renderKey() {
    const { currentFilter } = this.state;
    if (!currentFilter) {
      return null;
    }
    return (
      <span className={styles.key}>
        {`${currentFilter.label}`}
        <Divider type="vertical" />
      </span>
    );
  }

  renderTags() {
    const { tags } = this.state;
    const tagItems = tags.map((it) => {
      const { filter, value } = it;
      const { options } = filter || {};
      let label = value;
      if (options) {
        const current = options.find((item) => {
          const key = isBoolean(item.key) ? item.key.toString() : item.key;
          return key === (isBoolean(value) ? value.toString() : value);
        });
        label = current ? current.label : value;
      }
      return (
        <Tag
          key={filter.name}
          closable
          onClose={() => this.handleTagClose(filter.name)}
        >
          <span>{filter.label}</span>
          <Divider type="vertical" />
          <span>{label}</span>
        </Tag>
      );
    });
    return tagItems;
  }

  renderOptions() {
    const { currentFilter, tags } = this.state;
    const { options, correlateOption } = currentFilter;
    if (!options) {
      return null;
    }

    const correlateTag = tags.filter(
      (it) => it.filter.name === correlateOption
    );
    let subOptions = [];
    if (correlateOption && correlateTag[0]) {
      subOptions = options.filter(
        (it) => it.correlateValue.indexOf(correlateTag[0].value) > -1
      );
    }
    const menuItems = (subOptions[0] ? subOptions : options).map((it) => (
      <Menu.Item key={it.key}>{it.label}</Menu.Item>
    ));
    return (
      <Menu className={styles['option-menu']} onClick={this.handleOptionClick}>
        {menuItems}
      </Menu>
    );
  }

  renderMenu() {
    const { currentFilter, isFocus, optionClear, inputValue } = this.state;
    if (inputValue) {
      return null;
    }
    if (!isFocus) {
      return null;
    }
    if (currentFilter) {
      return this.renderOptions();
    }
    let filters = this.getFilterParams();
    if (optionClear) {
      filters = [];
    }

    const menuItems = filters.map((it) => (
      <Menu.Item key={it.name}>{it.label}</Menu.Item>
    ));
    return (
      <Menu
        className={styles.menu}
        onClick={this.handleSelectFilter}
        id="search-items-menu"
      >
        {this.renderOptionsClose(filters)}
        {menuItems}
      </Menu>
    );
  }

  // eslint-disable-next-line react/sort-comp
  clearOptions = () => {
    this.setState({
      optionClear: true,
    });
  };

  renderOptionsClose = (filters) => {
    const { filterParams } = this.props;
    const { optionClear } = this.state;
    if (optionClear || !filters[0] || filterParams.length === filters.length) {
      return null;
    }
    return (
      <Button
        className={styles['close-option-btn']}
        type="link"
        icon={<CloseOutlined />}
        onClick={this.clearOptions}
      />
    );
  };

  renderClose() {
    const { isFocus } = this.state;
    if (!isFocus) {
      return null;
    }
    return (
      <Col className={styles['close-btn-col']}>
        <Button
          className={styles['close-btn']}
          type="link"
          icon={<CloseOutlined />}
          onClick={this.clearAll}
        />
      </Col>
    );
  }

  getChecks() {
    const { filterParams } = this.props;
    const checks = [];
    filterParams.forEach((it) => {
      const { options = [] } = it;
      options.forEach((op) => {
        const { isQuick = false } = op;
        if (isQuick) {
          checks.push({
            ...op,
            father: it,
          });
        }
      });
    });
    return checks;
  }

  updateInput = (value) => {
    const { currentFilter, tags } = this.state;
    const newTag = {
      value,
      filter: currentFilter || this.getDefaultFilter(),
    };
    this.clearInputValue();
    const newTags = tags.filter((it) => it.filter.name !== newTag.filter.name);
    newTags.push(newTag);
    const quickTags = newTags.filter((it) => {
      const { value: tagValue, filter: { options = [] } = {} } = it;
      const quickOption = options.find((o) => o.key === tagValue && o.isQuick);
      return !!quickOption;
    });
    const checkValues = quickTags.map((it) => {
      return getCheckOptionValue(it.filter.name, it.value);
    });
    this.setState(
      {
        tags: newTags,
        currentFilter: null,
        inputValue: '',
        checkValues,
      },
      () => {
        this.onTagsChange();
      }
    );
  };

  clearInputValue = () => {
    this.setState({
      inputValue: '',
    });
  };

  clearAll = () => {
    this.clearInputValue();
    this.setState(
      {
        inputValue: '',
        tags: [],
        currentFilter: null,
        isFocus: false,
        optionClear: false,
        checkValues: [],
      },
      () => {
        this.onTagsChange();
        this.onFocusChange(false);
      }
    );
  };

  updateCheck = () => {};

  onChangeCheck = (values) => {
    const { checkValues } = this.state;
    const changedValues = [];
    values.forEach((it) => {
      if (checkValues.indexOf(it) < 0) {
        changedValues.push({
          key: it,
          value: true,
        });
      }
    });
    checkValues.forEach((it) => {
      if (values.indexOf(it) < 0) {
        changedValues.push({
          key: it,
          value: false,
        });
      }
    });
    const checkValuesNames = Array.from(
      new Set([...checkValues, ...values])
    ).map((it) => getCheckValueInfo(it).name);
    const { filterParams } = this.props;
    const { tags } = this.state;
    const otherTags = tags.filter(
      (it) => checkValuesNames.indexOf(it.filter.name) < 0
    );
    const newTags = [];
    changedValues.forEach((it) => {
      const { key, value } = it;
      if (value) {
        const { name, key: realValue } = getCheckValueInfo(key);
        const filter = filterParams.find((tt) => tt.name === name);
        newTags.push({
          value: realValue,
          filter,
        });
      }
    });
    this.setState(
      {
        tags: [...otherTags, ...newTags],
        checkValues: values,
      },
      () => {
        this.onTagsChange();
      }
    );
  };

  renderChecks() {
    const checks = this.getChecks();
    if (checks.length === 0) {
      return null;
    }
    const { checkValues } = this.state;
    const options = checks.map((it) => {
      const { checkLabel, key, father } = it;
      return {
        label: checkLabel,
        value: getCheckOptionValue(father.name, key),
      };
    });
    return (
      <div
        className={classnames(
          styles['magic-input-checks'],
          'magic-input-checks'
        )}
      >
        <Checkbox.Group
          options={options}
          onChange={this.onChangeCheck}
          value={checkValues}
        />
      </div>
    );
  }

  render() {
    const { placeholder } = this.props;
    const { isFocus, inputValue } = this.state;
    return (
      <div
        className={classnames(
          styles['magic-input-outer-wrapper'],
          'magic-input-outer-wrapper'
        )}
      >
        {this.renderChecks()}
        <Row
          className={classnames(
            'magic-input-wrapper',
            styles['magic-input-wrapper'],
            isFocus ? styles['magic-input-wrapper-active'] : '',
            isFocus ? 'magic-input-wrapper-active' : ''
          )}
        >
          <Col>{this.renderTags()}</Col>
          <Col>{this.renderKey()}</Col>
          <Col className={styles['input-wrapper']}>
            <Input
              className={styles.input}
              ref={this.inputRef}
              autoFocus={isFocus}
              placeholder={placeholder}
              onChange={this.handleInputChange}
              onBlur={this.handleBlur}
              onFocus={this.handleFocus}
              onPressEnter={this.handleEnter}
              onKeyUp={this.handleKeyUp}
              value={inputValue}
            />
            {this.renderMenu()}
          </Col>
          <Col
            className={`${styles['search-icon']} ${
              isFocus ? styles['search-icon-hidden'] : ''
            }`}
          >
            <SearchOutlined />
          </Col>
          {this.renderClose()}
        </Row>
      </div>
    );
  }
}

export default MagicInput;
