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
import { ListenerStore } from 'stores/octavia/listener';

@inject('rootStore')
@observer
export default class Create extends ModalAction {
  static id = 'create_listener';

  static title = t('Create Listener');

  policy = () => 'os_load-balancer_api:listener:post';

  get name() {
    return t('Create Listener');
  }

  static policy = 'os_load-balancer_api:listener:post';

  static allowed = (item) =>
    Promise.resolve(item.provisioning_status === 'ACTIVE');

  init() {
    this.store = new ListenerStore();
  }

  get defaultValue() {
    return {
      protocol: 'TCP',
      connection_limit: -1,
    };
  }

  onSubmit = (values) => {
    const data = {
      ...values,
      loadbalancer_id: this.containerProps.detail.id,
    };
    return this.store.create(data);
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'protocol',
        label: t('Protocol'),
        type: 'select',
        options: [
          {
            label: 'TCP',
            value: 'TCP',
          },
        ],
        required: true,
      },
      {
        name: 'protocol_port',
        label: t('Port'),
        type: 'input-number',
        required: true,
      },
      {
        name: 'connection_limit',
        label: t('Connection Limit'),
        type: 'input-number',
        min: -1,
        extra: t('-1 means no connection limit'),
        required: true,
      },
    ];
  }
}
