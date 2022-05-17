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

import React from 'react';
import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalVpnIKEPolicyStore from 'stores/neutron/vpn-ike-policy';
import globalVpnIPsecConnectionStore from 'stores/neutron/vpn-ipsec-connection';

export class Edit extends ModalAction {
  static id = 'edit-vpn-ike-policy';

  static title = t('Edit VPN IKE Policy');

  static buttonText = t('Edit');

  static policy = 'update_ikepolicy';

  static allowed = () => Promise.resolve(true);

  init() {
    this.state = {
      canSubmit: true,
      connections: [],
    };
    globalVpnIPsecConnectionStore
      .fetchList({ ikepolicy_id: this.item.id })
      .then((connections) => {
        connections.length > 0 &&
          this.setState({
            canSubmit: false,
            connections,
          });
      });
  }

  get defaultValue() {
    const { lifetime, ...rest } = this.item;
    return {
      ...rest,
      lifetimeValue: lifetime.value,
    };
  }

  onSubmit = (values) => {
    const { lifetimeValue, canSubmit, ...rest } = values;
    const data = {
      lifetime: {
        units: 'seconds',
        value: lifetimeValue,
      },
      ...rest,
    };
    return globalVpnIKEPolicyStore.update({ id: this.item.id }, data);
  };

  get formItems() {
    const { canSubmit } = this.state;
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
        withoutChinese: true,
      },
      {
        name: 'canSubmit',
        label: t('Status'),
        component: <>{t('In Use')}</>,
        validator: () => {
          const { connections } = this.state;
          if (!canSubmit) {
            return Promise.reject(
              new Error(`${t(
                'Unable to {action}, because : {reason}, instance: {name}.',
                {
                  action: this.name,
                  name: this.item.name,
                  reason: t('the policy is in use'),
                }
              )}\n
        ${t('Used by tunnel(s): {names}. ID(s): {ids}', {
          names: connections.map((i) => i.name).join(', '),
          ids: connections.map((i) => i.id).join(', '),
        })}`)
            );
          }
          return Promise.resolve(true);
        },
        hidden: canSubmit,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        required: false,
      },
      {
        name: 'auth_algorithm',
        label: t('Auth Algorithm'),
        type: 'select',
        options: ['sha1', 'sha256', 'sha384', 'sha512'].map((i) => ({
          label: i.toUpperCase(),
          value: i,
        })),
        required: true,
      },
      {
        name: 'encryption_algorithm',
        label: t('Encryption Algorithm'),
        type: 'select',
        options: ['3des', 'aes-128', 'aes-192', 'aes-256'].map((i) => ({
          label: i.toUpperCase(),
          value: i,
        })),
        required: true,
      },
      {
        name: 'pfs',
        label: t('PFS'),
        type: 'select',
        options: ['group2', 'group5', 'group14'].map((i) => ({
          label: i,
          value: i,
        })),
        required: true,
      },
      {
        name: 'lifetimeValue',
        label: t('Lifetime Value'),
        type: 'input-number',
        min: 0,
        required: true,
      },
      {
        name: 'ike_version',
        label: t('IKE Version'),
        type: 'select',
        options: ['v1', 'v2'].map((i) => ({
          label: i,
          value: i,
        })),
        required: true,
      },
    ];
  }
}

export default inject('rootStore')(observer(Edit));
