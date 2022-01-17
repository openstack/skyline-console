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
import { Select } from 'antd';

export default class EnumSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operator: this.getDefaultOperator(props),
      enums: this.getDefaultEnums(props),
    };
  }

  getDefaultOperator = () => {
    const { defaultValue, operators } = this.props;
    const current = operators.find((it) => defaultValue.indexOf(it) === 0);
    return current || operators[0];
  };

  getDefaultEnums = () => {
    const { defaultValue } = this.props;
    const defaultOperator = this.getDefaultOperator();
    const tmpList = defaultValue.split(`${defaultOperator} `);
    if (tmpList.length === 2 && tmpList[1]) {
      return tmpList[1].split(',');
    }
    return [];
  };

  getOptions = () => {
    const { operators = [] } = this.props;
    const options = operators.map((it) => ({
      value: it,
      label: it,
    }));
    return options;
  };

  getEnumOptions = () => {
    const { items = { enum: [] } } = this.props;
    const enumOptions = items.enum.map((it) => ({
      value: it,
      label: it,
    }));
    return enumOptions;
  };

  onChangeValue = () => {
    const { onChange } = this.props;
    if (onChange) {
      const { operator, enums } = this.state;
      onChange(`${operator} ${enums.join(',')}`);
    }
  };

  onChangeOperator = (value) => {
    this.setState(
      {
        operator: value,
      },
      this.onChangeValue
    );
  };

  onChangeEnum = (value) => {
    this.setState(
      {
        enums: value,
      },
      this.onChangeValue
    );
  };

  render() {
    const options = this.getOptions();
    const enumOptions = this.getEnumOptions();
    const defaultOperator = this.getDefaultOperator();
    const defaultEnums = this.getDefaultEnums();
    return (
      <div>
        <Select
          options={options}
          defaultValue={defaultOperator}
          onChange={this.onChangeOperator}
          placeholder={t('Please select')}
        />
        <Select
          options={enumOptions}
          mode="tags"
          defaultValue={defaultEnums}
          onChange={this.onChangeEnum}
          placeholder={t('Please select')}
        />
      </div>
    );
  }
}
