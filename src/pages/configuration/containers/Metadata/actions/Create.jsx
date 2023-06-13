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
import { jsonValidator } from 'utils/validate';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Import Metadata');

  init() {
    this.store = globalMetadataStore;
  }

  get name() {
    return t('Import metadata');
  }

  static policy = 'add_metadef_namespace';

  static allowed = () => Promise.resolve(true);

  get formItems() {
    return [
      {
        name: 'metadata',
        label: t('Metadata'),
        type: 'textarea-from-file',
        placeholder: t('Please input metadata'),
        required: true,
        rows: 6,
        validator: jsonValidator,
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
    const { metadata, options = {} } = values;
    let body = {};
    try {
      body = JSON.parse(metadata);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e, metadata);
    }
    if (!body) {
      body = {};
    }
    const { isPublic = false, isProtected = false } = options;
    body.protected = isProtected || false;
    body.visibility = isPublic === true ? 'public' : 'private';
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(Create));
