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
import globalVpnIPsecConnectionStore from 'stores/neutron/vpn-ipsec-connection';

const canEditStatus = ['ACTIVE', 'DOWN'];

export class Edit extends ModalAction {
  static id = 'edit-ipsec-site-connection';

  static title = t('Edit IPsec Site Connection');

  static buttonText = t('Edit');

  static policy = 'update_ipsec_site_connection';

  static allowed = (item) =>
    Promise.resolve(canEditStatus.indexOf(item.status) > -1);

  get defaultValue() {
    return {
      name: this.item.name,
      description: this.item.description,
    };
  }

  onSubmit = (values) => {
    const { name, description } = values;
    return globalVpnIPsecConnectionStore.update(
      { id: this.item.id },
      {
        name,
        description,
      }
    );
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
    ];
  }
}

export default inject('rootStore')(observer(Edit));
