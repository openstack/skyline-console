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
import { Input, Form } from 'antd';
import { ipValidate } from 'utils/validate';

const { ipv4Validator, ipv6Validator } = ipValidate;

export default class index extends Component {
  static isFormItem = true;

  getRules(rules, version) {
    let newRules = {
      validator: version === 4 ? ipv4Validator : ipv6Validator,
    };
    if (rules && rules.length > 0) {
      newRules = {
        ...newRules,
        ...rules[0],
      };
    }
    return [newRules];
  }

  render() {
    const { componentProps = {}, formItemProps = {} } = this.props;
    const { version = 4, ...componentRest } = componentProps;
    const placeholder =
      version === 4 ? t('Please input ipv4') : t('Please input ipv6');
    const props = {
      placeholder,
      ...componentRest,
    };
    const { rules, ...rest } = formItemProps;
    const newRules = this.getRules(rules, version);
    const newFormItemProps = {
      ...rest,
      rules: newRules,
    };
    return (
      <Form.Item {...newFormItemProps}>
        <Input {...props} />
      </Form.Item>
    );
  }
}
