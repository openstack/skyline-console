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
import Base from 'components/Form';

@inject('rootStore')
@observer
export default class ListenerStep extends Base {
  get title() {
    return 'Listener Detail';
  }

  get name() {
    return 'Listener Detail';
  }

  get isStep() {
    return true;
  }

  get defaultValue() {
    return {
      pool_protocol: 'TCP',
      listener_connection_limit: -1,
    };
  }

  allowed = () => Promise.resolve();

  get formItems() {
    return [
      {
        name: 'listener_name',
        label: t('Listener Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'listener_description',
        label: t('Listener Description'),
        type: 'textarea',
      },
      {
        name: 'listener_protocol',
        label: t('Listener Protocol'),
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
        name: 'listener_protocol_port',
        label: t('Listener Protocol Port'),
        type: 'input-number',
        required: true,
      },
      {
        name: 'listener_connection_limit',
        label: t('Listener Connection Limit'),
        type: 'input-number',
        min: -1,
        extra: t('-1 means no connection limit'),
        required: true,
      },
    ];
  }
}
