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
import classnames from 'classnames';
import { getValue } from 'utils/yaml';
import { isString } from 'lodash';
import styles from './index.less';
import AceEditor from './AceEditor';

const parseValue = (value) => {
  if (!isString(value)) {
    return value;
  }
  if (value.includes('<html>')) {
    const reg = /<\/h1>[\r\n]([\s\S]*)<\/body>/;
    const results = reg.exec(value);
    if (results) {
      const newValue = results[1].replace(/<br \/>/g, '');
      return newValue;
    }
  }
  try {
    const result = JSON.parse(value);
    return result;
  } catch (e) {
    return value;
  }
};

const getCodeValue = (value, mode) => {
  if (isString(value)) {
    return parseValue(value);
  }
  Object.keys(value).forEach((key) => {
    if (isString(value[key])) {
      value[key] = parseValue(value[key]);
    }
  });
  if (mode === 'json') {
    return JSON.stringify(value, null, 2);
  }
  if (mode === 'yaml') {
    return getValue(value);
  }
  return value;
};

class CodeEditor extends PureComponent {
  static propTypes = {
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
      PropTypes.array,
    ]),
    mode: PropTypes.string,
    options: PropTypes.object,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    value: {},
    mode: 'yaml',
    options: {},
    onChange() {},
  };

  constructor(props) {
    super(props);

    this.state = {
      value: getCodeValue(props.value, props.mode),
      originValue: props.value,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { value, mode } = props;

    if (value !== state.originValue) {
      return {
        value: getCodeValue(value, mode),
        originValue: value,
      };
    }

    return null;
  }

  handleChange = (value) => {
    const { onChange } = this.props;
    onChange(value);
  };

  render() {
    const { className, mode, options } = this.props;

    return (
      <AceEditor
        {...options}
        className={classnames(styles.editor, className)}
        value={this.state.value}
        mode={mode}
        onChange={this.handleChange}
      />
    );
  }
}

export default CodeEditor;
