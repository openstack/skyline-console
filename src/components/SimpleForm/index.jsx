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
import PropTypes from 'prop-types';
import { has } from 'lodash';
import classnames from 'classnames';

export default class index extends Component {
  static propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    initialValues: PropTypes.object,
    onFinish: PropTypes.func,
    size: PropTypes.string,
    formItems: PropTypes.array,
    formRef: PropTypes.any,
  };

  static defaultProps = {
    initialValues: {},
    size: 'large',
    formItems: [],
    onFinish: (values) => {
      // eslint-disable-next-line no-console
      console.log(values);
    },
  };

  renderFormItem = (item) => {
    const { render } = item;
    if (render) {
      return render();
    }
    return null;
  };

  getFormItemRules = (item) => {
    const { rules, required = false, message, otherRule } = item;
    if (has(item, 'rules')) {
      return rules;
    }
    const rule = {
      required,
    };
    if (message) {
      rule.message = message;
    }
    return otherRule ? [rule, otherRule] : [rule];
  };

  renderFormItems = () => {
    const { formItems } = this.props;
    // eslint-disable-next-line no-shadow
    return formItems.map((it, index) => {
      const { name, hidden, dependencies = [], className, onChange } = it;
      const options = {
        name,
        rules: this.getFormItemRules(it),
        hidden,
        dependencies,
        className,
      };
      if (onChange) {
        options.onChange = onChange;
      }
      return (
        <Form.Item {...options} key={`${name}-${index}`}>
          {this.renderFormItem(it)}
        </Form.Item>
      );
    });
  };

  render() {
    const { formItems, formRef, className, ...rest } = this.props;
    return (
      <Form
        ref={formRef}
        className={classnames(className, 'simple-form')}
        {...rest}
      >
        {this.renderFormItems()}
      </Form>
    );
  }
}
