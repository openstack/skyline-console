// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unles //required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { inject, observer } from 'mobx-react';
import { ModalAction } from 'src/containers/Action';
import { getYaml } from 'src/resources/heat/stack';
import globalCapsulesStore from 'src/stores/zun/capsules';

export class Create extends ModalAction {
  static id = 'create-capsules';

  static title = t('Create Capsule');

  init() {
    this.store = globalCapsulesStore;
    this.maxSize = 1;
  }

  static allowed = () => Promise.resolve(true);

  static buttonText = t('Create Capsule');

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('Create Capsule');
  }

  static policy = 'container:capsule:create';

  sizeValidate = (rule, value) => {
    if (!value) {
      return Promise.reject(t('Please select a file'));
    }
    const { size } = value;
    if (size <= this.maxSize * 1024 * 1024 * 1024) {
      return Promise.resolve();
    }
    return Promise.reject(
      t(
        'Please upload files smaller than { size }G on the page. It is recommended to upload files over { size }G using API.',
        { size: this.maxSize }
      )
    );
  };

  get formItems() {
    return [
      {
        name: 'template_file',
        label: t('Load Template from a file'),
        type: 'textarea-from-file',
      },
    ];
  }

  onSubmit = (values) => {
    const y = getYaml(values.template_file);

    return this.store.create({
      template: y,
    });
  };
}

export default inject('rootStore')(observer(Create));
