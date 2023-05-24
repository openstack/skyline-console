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
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { isArray } from 'lodash';

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: '',
    };
  }

  get progress() {
    return {
      strokeColor: {
        '0%': globalCSS.primaryColor,
        '100%': globalCSS.successColor,
      },
      strokeWidth: 3,
      format: (percent) => `${parseFloat(percent.toFixed(2))}%`,
    };
  }

  onChange = (file) => {
    this.setState(
      {
        file,
      },
      () => {
        const { onChange } = this.props;
        if (onChange) {
          onChange(file);
        }
      }
    );
  };

  handleChange = (info) => {
    const { file, fileList = [] } = info;
    const { status } = file || {};
    if (status === 'removed' && fileList.length === 0) {
      this.onChange(null);
    }
    if (!status) {
      this.onChange(file);
    }
    if (info.file.status !== 'uploading') {
      // eslint-disable-next-line no-console
      console.log(file, fileList);
    }
  };

  beforeUpload = () => {
    return false;
  };

  render() {
    const { value } = this.props;
    const { file } = this.state;
    let fileList;
    if (value) {
      fileList = isArray(value) ? value : [value];
    } else {
      fileList = file ? [file] : [];
    }
    const props = {
      ...this.props,
      name: 'file',
      action: '',
      headers: {
        authorization: 'authorization-text',
      },
      onChange: this.handleChange,
      progress: this.progress,
      beforeUpload: this.beforeUpload,
      fileList,
    };
    return (
      <Upload {...props}>
        {this.props.children || (
          <Button>
            <UploadOutlined /> {t('Click to Upload')}
          </Button>
        )}
      </Upload>
    );
  }
}
