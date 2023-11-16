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

import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalExtraSpecStore from 'stores/cinder/extra-spec';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Extra Spec');

  get name() {
    return t('Create Extra Spec');
  }

  static policy = 'volume_extension:types_extra_specs:create';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return {};
  }

  get instanceName() {
    return this.values.keyname;
  }

  get formItems() {
    return [
      {
        name: 'keyname',
        label: t('Parameter'),
        type: 'input',
        required: true,
        placeholder: t('Please input a parameter'),
      },
      {
        name: 'value',
        label: t('Value'),
        type: 'input',
        placeholder: t('Please input a value'),
        required: true,
      },
    ];
  }

  init() {
    this.store = globalExtraSpecStore;
  }

  onSubmit = (values) => {
    const { id } = this.containerProps.detail;
    const { keyname, value } = values;
    const extra_specs = { [keyname]: value };
    return this.store.createOrUpdate(id, extra_specs);
  };
}

export default inject('rootStore')(observer(Create));
