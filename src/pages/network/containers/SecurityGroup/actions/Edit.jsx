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
import globalSecurityGroupStore from 'stores/neutron/security-group';

export class EditAction extends ModalAction {
  static id = 'edit';

  static title = t('Edit');

  get defaultValue() {
    const { name, description } = this.item;
    const value = {
      name,
      description,
    };
    return value;
  }

  static policy = 'update_security_group';

  static allowed = (item) => Promise.resolve(item.name !== 'default');

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    return globalSecurityGroupStore.edit({ id }, values);
  };
}

export default inject('rootStore')(observer(EditAction));
