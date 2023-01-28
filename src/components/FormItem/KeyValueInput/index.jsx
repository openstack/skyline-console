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
import { Input, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { PauseOutlined } from '@ant-design/icons';

export default class index extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    // eslint-disable-next-line react/no-unused-prop-types
    value: PropTypes.object,
    keyReadonly: PropTypes.bool,
    valueReadonly: PropTypes.bool,
    keySpan: PropTypes.number,
    valueSpan: PropTypes.number,
    middleComponent: PropTypes.node,
    isTextarea: PropTypes.bool,
    textareaRows: PropTypes.number,
  };

  static defaultProps = {
    onChange: null,
    value: {
      key: '',
      value: '',
    },
    keyReadonly: false,
    valueReadonly: false,
    middleComponent: <PauseOutlined rotate={90} />,
    isTextarea: false,
    textareaRows: 2,
  };

  constructor(props) {
    super(props);
    this.state = {
      key: '',
      value: '',
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { key, value } = nextProps.value || {};
    if (key !== prevState.key || value !== prevState.value) {
      return {
        key,
        value,
      };
    }
    return null;
  }

  onChange = (value) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  };

  onKeyChange = (e) => {
    this.onChange({
      ...this.state,
      key: e.target.value,
    });
  };

  onValueChange = (e) => {
    this.onChange({
      ...this.state,
      value: e.target.value,
    });
  };

  renderInput(value, placeholder, readOnly) {
    const { isTextarea = false, textareaRows } = this.props;
    const props = {
      value,
      placeholder,
      onChange: this.onValueChange,
      readOnly,
      required: true,
    };
    if (isTextarea) {
      props.rows = textareaRows;
      return <Input.TextArea {...props} />;
    }
    return <Input {...props} />;
  }

  render() {
    const { key, value } = this.state;
    const {
      keyReadonly,
      valueReadonly,
      keySpan,
      valueSpan,
      keyPlaceholder = t('Please input key'),
      valuePlaceholder = t('Please input value'),
      middleComponent,
    } = this.props;
    const style = { textAlign: 'center', lineHeight: '30px', margin: '0 10px' };
    const component = <div style={style}>{middleComponent}</div>;
    return (
      <Row>
        <Col span={keySpan || 4}>
          <Input
            value={key}
            placeholder={keyPlaceholder}
            onChange={this.onKeyChange}
            readOnly={keyReadonly}
            required
          />
        </Col>
        {component}
        <Col span={valueSpan || 8}>
          {this.renderInput(value, valuePlaceholder, valueReadonly)}
        </Col>
      </Row>
    );
  }
}
