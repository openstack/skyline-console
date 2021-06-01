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
import { Form } from 'antd';
import { jsonValidator } from 'utils/validate';
import AceEditor from 'react-ace';

export default class JsonInput extends Component {
  static isFormItem = true;

  getRules(rules) {
    let newRules = {
      validator: jsonValidator,
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
    const { componentProps, formItemProps } = this.props;
    const { rules, ...rest } = formItemProps;
    const newRules = this.getRules(rules);
    const newFormItemProps = {
      ...rest,
      rules: newRules,
    };
    const options = {
      ...componentProps,
      mode: 'json',
      wrapEnabled: true,
      tabSize: 2,
      width: '100%',
      height: '200px',
      setOptions: {
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
      },
    };
    return (
      <Form.Item {...newFormItemProps}>
        <AceEditor {...options} />
      </Form.Item>
    );
  }
}
