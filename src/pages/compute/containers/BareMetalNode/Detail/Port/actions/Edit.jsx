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
import { isEmpty, has, isEqual, get } from 'lodash';
import { macAddressValidate } from 'utils/validate';
import { updateObjToAddSelectArray } from 'utils/index';
import { getDifFromAddSelectValue } from 'resources/ironic/ironic';

export class Edit extends ModalAction {
  static id = 'EditPort';

  static title = t('Edit Port');

  static buttonText = t('Edit');

  init() {
    this.groupStore = new IronicPortGroupStore();
    this.getPortGroups();
  }

  get name() {
    return t('Edit Port');
  }

  get instanceName() {
    return this.item.uuid;
  }

  static policy = 'baremetal:port:update';

  // static allowed = item => Promise.resolve(item.provision_state !== 'active');
  static allowed = () => Promise.resolve(true);

  getPortGroups() {
    const { uuid } = this.containerProps.detail || {};
    this.groupStore.fetchList({ id: uuid });
  }

  get defaultValue() {
    const { name: node, uuid: nodeUuid } = this.containerProps.detail || {};
    const { port_id, switch_id, switch_info } =
      this.item.local_link_connection || {};
    const {
      pxe_enabled,
      address,
      portgroup_uuid,
      extra = {},
      physical_network,
    } = this.item;
    return {
      node: node || nodeUuid,
      address,
      pxe_enabled,
      portgroup_uuid,
      physical_network,
      'local_link_connection.port_id': port_id,
      'local_link_connection.switch_id': switch_id,
      'local_link_connection.switch_info': switch_info,
      extra: updateObjToAddSelectArray(extra),
    };
  }

  updateItemValueToArray = (data, key) => {
    const value = data[key] || {};
    const values = [];
    Object.keys(value).forEach((it, index) => {
      values.push({
        index,
        value: { key: it, value: value[it] },
      });
    });
    data[key] = values;
  };

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
        name: 'local_link_connection.port_id',
        label: t('Port ID'),
        type: 'input',
        tip: t(
          'Identifier of the physical port on the switch to which node’s port is connected to'
        ),
      },
      {
        name: 'local_link_connection.switch_id',
        label: t('Switch ID'),
        type: 'input',
        tip: t(
          'Only a MAC address or an OpenFlow based datapath_id of the switch are accepted in this field'
        ),
      },
      {
        name: 'local_link_connection.switch_info',
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

  getKeyPath = (key) => {
    const prefix = 'local_link_connection.';
    if (key.indexOf(prefix) === 0) {
      return `/local_link_connection/${key.substring(prefix.length)}`;
    }
    return `/${key}`;
  };

  onSubmit = (values) => {
    const adds = [];
    const replaces = [];
    const dels = [];
    const oldExtra = updateObjToAddSelectArray(this.item.extra);
    const { extra, node, ...rest } = values;
    Object.keys(rest).forEach((key) => {
      const value = values[key];
      const path = this.getKeyPath(key);
      const obj = { value, path };
      if (!has(this.item, key) && values[key]) {
        obj.op = 'add';
        adds.push(obj);
      } else {
        const oldValue = get(this.item, key);
        if (!isEqual(oldValue, values[key])) {
          obj.op = 'replace';
          replaces.push(obj);
        }
      }
    });
    const {
      adds: eAdds,
      replaces: eReplaces,
      dels: eDels,
    } = getDifFromAddSelectValue(extra, oldExtra, 'extra');
    adds.push(...eAdds);
    replaces.push(...eReplaces);
    dels.push(...eDels);
    const body = [...adds, ...replaces, ...dels];
    if (body.length === 0) {
      return Promise.resolve();
    }
    return globalIronicPortStore.edit({ id: this.item.uuid }, body);
  };
}

export default inject('rootStore')(observer(Edit));
