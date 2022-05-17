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
import globalIronicPortGroupStore from 'stores/ironic/port-group';
import { ModalAction } from 'containers/Action';
import { yesNoOptions } from 'utils/constants';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { isEmpty, has, isEqual, get } from 'lodash';
import { macAddressValidate } from 'utils/validate';
import { updateObjToAddSelectArray } from 'utils/index';
import { getDifFromAddSelectValue } from 'resources/ironic/ironic';

export class Edit extends ModalAction {
  static id = 'EditPortGroup';

  static title = t('Edit Port Group');

  static buttonText = t('Edit');

  get name() {
    return t('Edit Port Group');
  }

  get instanceName() {
    return this.item.uuid;
  }

  static policy = 'baremetal:portgroup:update';

  // static allowed = item => Promise.resolve(item.provision_state !== 'active');
  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const { name: node, uuid: nodeUuid } = this.containerProps.detail || {};
    const {
      name,
      standalone_ports_supported,
      address,
      extra = {},
      properties = {},
    } = this.item;
    return {
      node: node || nodeUuid,
      name,
      address,
      standalone_ports_supported,
      extra: updateObjToAddSelectArray(extra),
      properties: updateObjToAddSelectArray(properties),
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

  get formItems() {
    return [
      {
        name: 'node',
        label: t('Node'),
        type: 'label',
        iconType: 'host',
      },
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
      },
      {
        name: 'address',
        label: t('MAC Address'),
        type: 'input',
        required: true,
        validator: macAddressValidate,
      },
      {
        name: 'standalone_ports_supported',
        label: t('Stand Alone Ports Supported'),
        type: 'radio',
        options: yesNoOptions,
      },
      {
        name: 'properties',
        label: t('Properties'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add Property'),
        validator: (rule, value) => {
          if (!this.checkKeyValues(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(t('Please enter complete key value!'));
          }
          return Promise.resolve();
        },
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
    const oldProps = updateObjToAddSelectArray(this.item.properties);
    const { properties, extra, node, ...rest } = values;
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
    const {
      adds: pAdds,
      replaces: pReplaces,
      dels: pDels,
    } = getDifFromAddSelectValue(properties, oldProps, 'properties');
    adds.push(...pAdds, ...eAdds);
    replaces.push(...pReplaces, ...eReplaces);
    dels.push(...pDels, ...eDels);
    const body = [...adds, ...replaces, ...dels];
    if (body.length === 0) {
      return Promise.resolve();
    }
    return globalIronicPortGroupStore.edit({ id: this.item.uuid }, body);
  };
}

export default inject('rootStore')(observer(Edit));
