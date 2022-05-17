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
import { isEmpty } from 'lodash';
import { macAddressValidate } from 'utils/validate';
import { updateAddSelectValueToObj } from 'utils/index';

export class Create extends ModalAction {
  static id = 'CreatePort';

  static title = t('Create Port Group');

  get name() {
    return t('Create Port Group');
  }

  get messageHasItemName() {
    return false;
  }

  static policy = 'baremetal:portgroup:create';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const { name, uuid } = this.item;
    return {
      node: name || uuid,
      standalone_ports_supported: true,
    };
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

  onSubmit = (values) => {
    const { properties, extra, node, ...rest } = values;
    const body = {
      ...rest,
      node_uuid: this.item.uuid,
      extra: updateAddSelectValueToObj(extra),
      properties: updateAddSelectValueToObj(properties),
    };

    return globalIronicPortGroupStore.create(body);
  };
}

export default inject('rootStore')(observer(Create));
