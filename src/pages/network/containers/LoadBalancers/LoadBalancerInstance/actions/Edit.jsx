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
import globalLbaasStore from 'stores/octavia/loadbalancer';

export class Edit extends ModalAction {
  static id = 'edit_load_balancer';

  static title = t('Edit');

  policy = () => 'edit_load_balancer';

  get name() {
    return t('Edit Load Balancer');
  }

  static policy = 'os_load-balancer_api:loadbalancer:put';

  static allowed = (item, containerProps) => {
    const { isAdminPage = false } = containerProps;
    return Promise.resolve(!isAdminPage && checkStatus(item));

    function checkStatus(i) {
      return i.provisioning_status === 'ACTIVE';
    }
  };

  get defaultValue() {
    const { item } = this;
    return {
      name: item.name,
      description: item.description,
    };
  }

  onSubmit = (values) => globalLbaasStore.update({ id: this.item.id }, values);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Load Balancer Name'),
        type: 'input-name',
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
}

export default inject('rootStore')(observer(Edit));
