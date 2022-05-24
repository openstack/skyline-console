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
import { nameTypeValidate, nameMessageInfo } from 'utils/validate';

const {
  nameMessage,
  nameMessageWithoutChinese,
  filenameMessage,
  keypairNameMessage,
  stackNameMessage,
  crontabNameMessage,
  imageNameMessage,
  instanceNameMessage,
  swiftFilenameMessage,
  databaseNameMessage,
  databaseUserNameMessage,
} = nameMessageInfo;

const {
  nameValidate,
  nameValidateWithoutChinese,
  fileNameValidate,
  keypairNameValidate,
  stackNameValidate,
  crontabNameValidate,
  imageNameValidate,
  instanceNameValidate,
  swiftFileNameValidate,
  databaseNameValidate,
  databaseUserNameValidate,
} = nameTypeValidate;

export default class index extends Component {
  static isFormItem = true;

  getRules({
    names,
    rules,
    withoutChinese,
    isFile,
    isKeypair,
    isStack,
    isCrontab,
    isImage,
    isInstance,
    isSwiftFile,
    isDatabaseName,
    isDatabaseUserName,
  }) {
    const uniqueNameValidate = (rule, value) => {
      if (names && names.length && names.includes(value)) {
        const message = t('Name can not be duplicated');
        return Promise.reject(new Error(`${t('Invalid: ')}${message}`));
      }
      return Promise.resolve(true);
    };
    const uniqueRule = {
      validator: uniqueNameValidate,
    };
    let validator = nameValidate;
    if (isFile) {
      validator = fileNameValidate;
    } else if (withoutChinese) {
      validator = nameValidateWithoutChinese;
    } else if (isKeypair) {
      validator = keypairNameValidate;
    } else if (isStack) {
      validator = stackNameValidate;
    } else if (isImage) {
      validator = imageNameValidate;
    } else if (isInstance) {
      validator = instanceNameValidate;
    } else if (isCrontab) {
      validator = crontabNameValidate;
    } else if (isSwiftFile) {
      validator = swiftFileNameValidate;
    } else if (isDatabaseName) {
      validator = databaseNameValidate;
    } else if (isDatabaseUserName) {
      validator = databaseUserNameValidate;
    }
    const newRules = {
      validator,
    };
    if (rules && rules.length > 0) {
      return [...rules, newRules, uniqueRule];
    }
    return [newRules, uniqueRule];
  }

  getMessage({
    withoutChinese,
    isFile,
    isKeypair,
    isStack,
    isCrontab,
    isImage,
    isInstance,
    isSwiftFile,
    isDatabaseName,
    isDatabaseUserName,
  }) {
    if (withoutChinese) {
      return nameMessageWithoutChinese;
    }
    if (isStack) {
      return stackNameMessage;
    }
    if (isFile) {
      return filenameMessage;
    }
    if (isKeypair) {
      return keypairNameMessage;
    }
    if (isCrontab) {
      return crontabNameMessage;
    }
    if (isImage) {
      return imageNameMessage;
    }
    if (isInstance) {
      return instanceNameMessage;
    }
    if (isSwiftFile) {
      return swiftFilenameMessage;
    }
    if (isDatabaseName) {
      return databaseNameMessage;
    }
    if (isDatabaseUserName) {
      return databaseUserNameMessage;
    }
    return nameMessage;
  }

  render() {
    const { componentProps, formItemProps } = this.props;
    const {
      withoutChinese = false,
      isFile = false,
      isKeypair = false,
      isSwiftFile = false,
      isDatabaseName = false,
      isDatabaseUserName = false,
      isStack,
      isCrontab,
      isImage,
      isInstance,
      names,
      ...componentRest
    } = componentProps;
    const placeholder = isFile
      ? t('Please input file name')
      : t('Please input name');
    const props = {
      placeholder,
      ...componentRest,
    };
    const { rules, ...rest } = formItemProps;
    const newRules = this.getRules({
      names,
      rules,
      withoutChinese,
      isFile,
      isKeypair,
      isStack,
      isCrontab,
      isImage,
      isInstance,
      isSwiftFile,
      isDatabaseName,
      isDatabaseUserName,
    });
    const message = this.getMessage({
      withoutChinese,
      isFile,
      isKeypair,
      isStack,
      isCrontab,
      isImage,
      isInstance,
      isSwiftFile,
      isDatabaseName,
      isDatabaseUserName,
    });
    const newFormItemProps = {
      ...rest,
      rules: newRules,
      extra: message,
    };
    return (
      <Form.Item {...newFormItemProps}>
        <Input {...props} />
      </Form.Item>
    );
  }
}
