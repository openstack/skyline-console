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
import globalFloatingIpsStore from 'stores/neutron/floatingIp';
import { ModalAction } from 'containers/Action';
import { isNotError } from 'resources/nova/instance';

export class DisAssociateFip extends ModalAction {
  static id = 'DisAssociateFip';

  static title = t('Disassociate Floating IP');

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('Disassociate Floating IP');
  }

  get defaultValue() {
    const { name } = this.item;
    const value = {
      virtualAdapter: name,
    };
    return value;
  }

  static policy = 'update_floatingip';

  static allowed = (item, containerProps) => {
    const { isAdminPage = false } = containerProps;
    return Promise.resolve(
      !isAdminPage && isNotError(item) && canDisassociated()
    );

    function canDisassociated() {
      return item.associatedDetail && item.associatedDetail.length;
    }
  };

  get formItems() {
    const { associatedDetail } = this.item;
    return [
      {
        name: 'virtualAdapter',
        label: t('Virtual Adapter'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'floating_ip',
        label: t('Floating IP'),
        type: 'select-table',
        required: true,
        data: associatedDetail,
        isMulti: false,
        tagKey: 'floating_ip_address',
        filterParams: [
          {
            label: t('Fixed IP Address'),
            name: 'fixed_ip_address',
          },
        ],
        columns: [
          {
            title: t('Fixed IP Address'),
            dataIndex: 'fixed_ip_address',
          },
          {
            title: t('Floating IP Address'),
            dataIndex: 'floating_ip_address',
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { floating_ip } = values;
    const { id } = floating_ip.selectedRows[0];
    return globalFloatingIpsStore.disassociateFip({ id });
  };
}

export default inject('rootStore')(observer(DisAssociateFip));
