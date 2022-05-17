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
import globalIronicPortStore from 'stores/ironic/port';
import { IronicPortGroupStore } from 'stores/ironic/port-group';
import { ModalAction } from 'containers/Action';
import { yesNoOptions } from 'utils/constants';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { isEmpty } from 'lodash';
import { macAddressValidate } from 'utils/validate';
import { updateAddSelectValueToObj } from 'utils/index';

export class Create extends ModalAction {
  static id = 'CreatePort';

  static title = t('Create Port');

  init() {
    this.groupStore = new IronicPortGroupStore();
    this.getPortGroups();
  }

  get name() {
    return t('Create Port');
  }

  get messageHasItemName() {
    return false;
  }

  static policy = 'baremetal:port:create';

  static allowed = () => Promise.resolve(true);

  getPortGroups() {
    const { uuid } = this.item;
    this.groupStore.fetchList({ id: uuid });
  }

  get defaultValue() {
    const { name, uuid } = this.item;
    return {
      node: name || uuid,
      pxe_enabled: true,
    };
  }

  get portGroups() {
    return (this.groupStore.list.data || []).map((it) => ({
      value: it.uuid,
      label: it.name || it.uuid,
    }));
  }

  get formItems() {
    return [
      {
        name: 'node',
        label: t('Node'),
        type: 'label',
        iconType: 'host',
      },
      {
        name: 'address',
        label: t('MAC Address'),
        required: true,
        type: 'input',
        validator: macAddressValidate,
      },
      {
        name: 'pxe_enabled',
        label: t('PXE Enabled'),
        type: 'radio',
        options: yesNoOptions,
      },
      {
        name: 'portgroup_uuid',
        label: t('Port Group'),
        type: 'select',
        options: this.portGroups,
      },
      {
        label: t('Local Link Connection'),
        type: 'title',
      },
      {
        name: 'port_id',
        label: t('Port ID'),
        type: 'input',
        tip: t(
          'Identifier of the physical port on the switch to which node’s port is connected to'
        ),
      },
      {
        name: 'switch_id',
        label: t('Switch ID'),
        type: 'input',
        tip: t(
          'Only a MAC address or an OpenFlow based datapath_id of the switch are accepted in this field'
        ),
      },
      {
        name: 'switch_info',
        label: t('Switch Info'),
        type: 'input',
        tip: t(
          'an optional string field to be used to store any vendor-specific information'
        ),
      },
      {
        name: 'physical_network',
        label: t('Physical Network'),
        type: 'input',
        tip: t('The name of the physical network to which a port is connected'),
      },
      {
        name: 'extra',
        label: t('Extra Infos'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add Extra Info'),
        validator: (rule, value) => {
          if (!this.checkKeyValues(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(t('Please enter complete key value!'));
          }
          return Promise.resolve();
        },
      },
    ];
  }

  checkKeyValues = (values) => {
    if (isEmpty(values)) {
      return true;
    }
    const item = values.find((it) => {
      const { key, value } = it.value || {};
      return !key || value === undefined || value === null;
    });
    return !item;
  };

  onSubmit = (values) => {
    const { port_id, switch_id, switch_info, extra, node, ...rest } = values;
    const body = {
      ...rest,
      local_link_connection: {
        port_id,
        switch_id,
        switch_info,
      },
      node_uuid: this.item.uuid,
      extra: updateAddSelectValueToObj(extra),
    };

    return globalIronicPortStore.create(body);
  };
}

export default inject('rootStore')(observer(Create));
