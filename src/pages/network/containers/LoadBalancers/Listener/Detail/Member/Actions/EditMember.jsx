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
import globalPoolMemberStore from 'stores/octavia/pool-member';
import { toJS } from 'mobx';

export class Edit extends ModalAction {
  init() {
    this.state = {};
    this.store = globalPoolMemberStore;
  }

  static id = 'member-edit';

  static title = t('Edit Member');

  static buttonText = t('Edit Member');

  get name() {
    return t('edit member');
  }

  get defaultValue() {
    const { weight, protocol_port } = this.item;
    if (weight && protocol_port && this.formRef.current) {
      this.formRef.current.setFieldsValue({ weight, protocol_port });
    }
    return { weight, protocol_port };
  }

  static policy = 'os_load-balancer_api:member:put';

  protocolValidator = (rule, value) => {
    const { address, protocol_port } = this.item;
    const repeatPort = (globalPoolMemberStore.list.data || []).find(
      (member) =>
        member.address === address &&
        value === member.protocol_port &&
        value !== protocol_port
    );
    if (repeatPort) {
      return Promise.reject(new Error(t('Invalid IP Address and Port')));
    }
    return Promise.resolve();
  };

  get formItems() {
    return [
      {
        name: 'weight',
        label: t('Weight'),
        type: 'input-number',
        required: true,
      },
      {
        name: 'protocol_port',
        label: t('Port'),
        type: 'input-number',
        required: true,
        validator: this.protocolValidator,
      },
    ];
  }

  static allowed = (item) =>
    Promise.resolve(item.provisioning_status === 'ACTIVE');

  onSubmit = (value) => {
    const { default_pool_id } = this.containerProps.detail;
    const { id: member_id } = this.item;
    const members = toJS(this.store.list.data);
    const data = members.map((member) => {
      if (member.id === member_id) {
        const { weight, protocol_port } = value;
        member.weight = weight;
        member.protocol_port = protocol_port;
      }
      const { weight, protocol_port, address, name, subnet_id } = member;
      return { weight, protocol_port, address, name, subnet_id };
    });
    return this.store.batchUpdate({ default_pool_id, data });
  };
}

export default inject('rootStore')(observer(Edit));
