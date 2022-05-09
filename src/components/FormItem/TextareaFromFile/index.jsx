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
import { Input, Upload, Button } from 'antd';
import { getText } from 'utils/file';
import PropTypes from 'prop-types';

export default class index extends Component {
  static propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
    accept: PropTypes.any,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    value: '',
    placeholder: t('Please input'),
    accept: '',
    onChange: (values) => {
      // eslint-disable-next-line no-console
      console.log(values);
    },
  };

  onChange = (value) => {
    const { onChange } = this.props;
    onChange && onChange(value);
  };

  handleUpload = async (file) => {
    const value = await getText(file);
    this.onChange(value);
    return false;
  };

  onChangeInput = (value) => {
    this.onChange(value);
  };

  render() {
    const { value, placeholder, accept, ...rest } = this.props;
    return (
      <>
        <Input.TextArea
          placeholder={placeholder}
          value={value}
          onChange={this.onChange}
          style={{
            fontFamily:
              '"Menlo", "Liberation Mono", "Consolas", "DejaVu Sans Mono", "Ubuntu Mono", "Courier New", "andale mono", "lucida console", monospace',
          }}
          {...rest}
        />
        <Upload
          beforeUpload={this.handleUpload}
          showUploadList={false}
          accept={accept}
        >
          <Button type="link">{t('Load from local files')}</Button>
        </Upload>
      </>
    );
  }
}
