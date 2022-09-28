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
import { QoSPolicyStore } from 'stores/neutron/qos-policy';

export class Edit extends ModalAction {
  static id = 'edit_qos_policy';

  static title = t('Edit QoS Policy');

  policy = () => ({ rules: [['network', 'edit_qos_policy']] });

  get name() {
    return t('Edit QoS Policy');
  }

  static policy = 'update_policy';

  static aliasPolicy = 'neutron:update_policy';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = new QoSPolicyStore();
  }

  get defaultValue() {
    const { item } = this.props;
    return {
      ...item,
    };
  }

  onSubmit = (values) => this.store.update(this.props.item, values);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Policy Name'),
        type: 'input-name',
        withoutChinese: true,
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'shared',
        label: t('Shared'),
        type: 'switch',
        hidden: !this.isAdminPage,
      },
      {
        name: 'is_default',
        label: t('Default Policy'),
        type: 'switch',
        hidden: !this.isAdminPage,
      },
    ];
  }
}

export default inject('rootStore')(observer(Edit));
