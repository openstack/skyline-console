// Copyright 2022 99cloud
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
  }

  static allowed = () => Promise.resolve(true);

  static buttonText = t('Create Capsule');

  static get modalSize() {
    return 'middle';
  }

  get name() {
    return t('Create Capsule');
  }

  static policy = 'capsule:create';

  get formItems() {
    return [
      {
        name: 'template_file',
        label: t('Load Template from a file'),
        type: 'textarea-from-file',
        rows: 6,
        required: true,
        accept: '.yaml',
        validator: (rule, value) => {
          if (!value) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(
              t('Please input or load Template from a file')
            );
          }
          return Promise.resolve();
        },
      },
    ];
  }

  onSubmit = (values) => {
    const template = getYaml(values.template_file);

    return this.store.create({
      template,
    });
  };
}

export default inject('rootStore')(observer(Create));
