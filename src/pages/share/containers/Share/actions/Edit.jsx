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
import globalShareStore from 'stores/manila/share';
import { checkPolicyRule } from 'resources/skyline/policy';

export class Edit extends ModalAction {
  static id = 'edit';

  static title = t('Edit');

  get defaultValue() {
    const { name, description, is_public } = this.item;
    const value = {
      display_name: name,
      display_description: description,
      is_public,
    };
    return value;
  }

  static policy = 'share:update';

  static allowed = (item) => Promise.resolve(item.isMine);

  checkShowPublic() {
    return checkPolicyRule('share:set_public_share');
  }

  get formItems() {
    return [
      {
        name: 'display_name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'display_description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'is_public',
        label: t('Public'),
        type: 'check',
        content: t('Public'),
        tip: t('If set then all tenants will be able to see this share.'),
        display: this.checkShowPublic(),
      },
    ];
  }

  init() {
    this.store = globalShareStore;
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { is_public, ...rest } = values;
    const body = {
      ...rest,
    };
    if (this.checkShowPublic()) {
      body.is_public = is_public;
    }
    return this.store.update(id, body);
  };
}

export default inject('rootStore')(observer(Edit));
