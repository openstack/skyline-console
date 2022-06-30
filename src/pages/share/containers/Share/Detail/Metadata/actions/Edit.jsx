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
import globalShareMetadataStore from 'stores/manila/share-metadata';

export class Edit extends ModalAction {
  static id = 'edit';

  static title = t('Edit Share Metadata');

  static buttonText = t('Edit');

  get name() {
    return t('Edit Share Metadata');
  }

  get instanceName() {
    return this.item.keyName;
  }

  get defaultValue() {
    const { keyName, value } = this.item;
    const defaultValue = {
      keyName,
      value,
    };
    return defaultValue;
  }

  static policy = 'share:update_share_metadata';

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'keyName',
        label: t('Key'),
        type: 'input',
        disabled: true,
        placeholder: t('Please input key'),
      },
      {
        name: 'value',
        label: t('Value'),
        type: 'input',
        placeholder: t('Please input value'),
      },
    ];
  }

  init() {
    this.store = globalShareMetadataStore;
  }

  onSubmit = (values) => {
    const { id } = this.containerProps.detail;
    const { keyName, value } = values;
    const extra_specs = { [keyName]: value };
    return this.store.createOrUpdate(id, extra_specs);
  };
}

export default inject('rootStore')(observer(Edit));
