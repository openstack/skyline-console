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
import { portRangeValidate, portRangeMessage } from 'utils/validate';

export default class index extends Component {
  static isFormItem = true;

  getRules(rules, required, requiredMessage) {
    const newRules = {
      validator: portRangeValidate,
    };
    if (required) {
      newRules.required = required;
      newRules.message = requiredMessage;
    }
    return [newRules, ...rules];
  }

  render() {
    const { componentProps, formItemProps } = this.props;
    const { required, label } = componentProps || {};
    const placeholder = t('Please input {label}', { label });
    const props = {
      placeholder,
      ...componentProps,
    };
    const { rules, extra, ...rest } = formItemProps;
    const newRules = this.getRules(rules, required, placeholder);
    const newFormItemProps = {
      ...rest,
      rules: newRules,
      extra: extra || portRangeMessage,
    };
    return (
      <Form.Item {...newFormItemProps}>
        <Input {...props} />
      </Form.Item>
    );
  }
}
