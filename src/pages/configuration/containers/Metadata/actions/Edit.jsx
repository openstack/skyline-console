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
import globalMetadataStore from 'stores/glance/metadata';
import { ModalAction } from 'containers/Action';

export class Edit extends ModalAction {
  static id = 'edit';

  static title = t('Edit Metadata');

  static buttonText = t('Edit');

  init() {
    this.store = globalMetadataStore;
  }

  get name() {
    return t('Edit metadata');
  }

  get instanceName() {
    return this.item.display_name;
  }

  static policy = 'modify_metadef_namespace';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const { namespace, protected: isProtected, visibility } = this.item;
    return {
      namespace,
      options: {
        isProtected,
        isPublic: visibility === 'public',
      },
    };
  }

  get formItems() {
    return [
      {
        name: 'namespace',
        label: t('Namespace'),
        iconType: 'metadata',
        type: 'label',
      },
      {
        name: 'options',
        label: t('Options'),
        type: 'check-group',
        options: [
          { label: t('Public'), value: 'isPublic' },
          { label: t('Protected'), value: 'isProtected' },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { display_name, description } = this.item;
    const { namespace, options } = values;
    const { isPublic, isProtected } = options;
    const body = {
      display_name,
      description,
      namespace,
      protected: isProtected,
      visibility: isPublic === true ? 'public' : 'private',
    };
    return globalMetadataStore.edit({ id: namespace }, body);
  };
}

export default inject('rootStore')(observer(Edit));
