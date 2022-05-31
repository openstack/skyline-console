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

import React from 'react';
import { ModalAction } from 'containers/Action';
import { inject, observer } from 'mobx-react';
import { onlyAdminCanReadPolicy } from 'resources/skyline/policy';
import CodeEditor from 'components/CodeEditor';

export class View extends ModalAction {
  get id() {
    return 'view';
  }

  static title = t('View Detail');

  static readOnly = true;

  static enableSystemReader = true;

  get name() {
    return t('View');
  }

  get instanceName() {
    return this.item.key;
  }

  static policy = onlyAdminCanReadPolicy;

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    const { key } = this.item;
    return {
      key,
    };
  }

  renderContent = () => {
    const props = {
      value: this.item.value,
      mode: 'json',
      options: {
        readOnly: true,
      },
    };
    return <CodeEditor {...props} />;
  };

  get labelCol() {
    return {
      xs: { span: 4 },
      sm: { span: 4 },
    };
  }

  get wrapperCol() {
    return {
      xs: { span: 20 },
      sm: { span: 20 },
    };
  }

  get formItems() {
    return [
      {
        name: 'key',
        type: 'label',
        label: t('Name'),
      },
      {
        name: 'value',
        type: 'other',
        label: t('Value'),
        content: this.renderContent(),
      },
    ];
  }

  onSubmit = null;
}

export default inject('rootStore')(observer(View));
