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
import Base from 'components/Form';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { isEmpty } from 'lodash';
import globalIronicStore from 'stores/ironic/ironic';

const filterCustomTrait = (item) => item.indexOf('CUSTOM_') < 0;

export class NodeInfo extends Base {
  init() {
    this.getTraits();
  }

  async getTraits() {
    await globalIronicStore.getTraits();
    this.updateDefaultValue();
  }

  get traits() {
    const { traits = [] } = globalIronicStore;
    return traits
      .filter((it) => filterCustomTrait(it))
      .map((it) => ({
        value: it,
        label: it,
      }));
  }

  get drivers() {
    return [{ value: 'ipmi', label: 'IPMI' }];
  }

  allowed = () => Promise.resolve();

  checkKeyValues = (values) => {
    if (isEmpty(values)) {
      return true;
    }
    const item = values.find((it) => {
      const { key, value } = it.value || {};
      if (this.needKeys.indexOf(key) >= 0) {
        return false;
      }
      return !key || value === undefined || value === null;
    });
    return !item;
  };

  checkCustomTrait = (values) => {
    if (isEmpty(values)) {
      return true;
    }
    const item = values.find((it) => {
      const { value } = it || {};
      if (!value) {
        return true;
      }
      const r = /^CUSTOM_[A-Z0-9_]{1,248}$/;
      if (!r.test(value)) {
        return true;
      }
      return false;
    });
    return !item;
  };

  get needKeys() {
    return ['cpus', 'memory_mb', 'local_gb', 'cpu_arch'];
  }

  getDefaultPropValues = (values) => {
    const items = [];
    this.needKeys.forEach((key) => {
      const item = values.find((it) => it.value.key === key);
      const value = item ? item.value.value : '';
      items.push({
        index: items.length,
        value: {
          key,
          value,
        },
      });
    });
    values.forEach((it) => {
      const { key } = it.value;
      if (this.needKeys.indexOf(key) < 0) {
        items.push(it);
      }
    });
    return items;
  };

  getDefaultStandardTrait = (traits) => {
    const items = [...traits];
    items.sort();
    return items.filter((it) => filterCustomTrait(it));
  };

  getDefaultCustomTrait = (traits) => {
    const items = [...traits];
    items.sort();
    return items
      .filter((it) => !filterCustomTrait(it))
      .map((it, index) => ({
        index,
        value: it,
      }));
  };

  get defaultValue() {
    const {
      extra: {
        driver = 'ipmi',
        name,
        properties = [],
        extra = [],
        traits = [],
        resource_class,
      } = {},
    } = this.props;
    const data = {
      name: name || undefined,
      driver,
      properties: this.getDefaultPropValues(properties),
      extra,
      resource_class,
      standard_trait: this.getDefaultStandardTrait(traits),
      custom_trait: this.getDefaultCustomTrait(traits),
    };
    return data;
  }

  hasPropValues = (values) =>
    values.some((it) => this.needKeys.indexOf(it.value.key) && it.value.value);

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Node Name'),
        type: 'input-name',
      },
      {
        name: 'driver',
        label: t('Node Driver'),
        type: 'select',
        options: this.drivers,
        required: true,
      },
      {
        name: 'properties',
        label: t('Properties'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add Property'),
        minCount: this.needKeys.length,
        readonlyKeys: this.needKeys,
        tips: t(
          'If you do not fill in parameters such as cpus, memory_mb, local_gb, cpu_arch, etc., you can automatically inject the configuration and Mac address of the physical machine by performing the "Auto Inspect" operation.'
        ),
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
      {
        name: 'standard_trait',
        label: t('Standard Trait'),
        type: 'select',
        mode: 'multiple',
        options: this.traits,
        extra: t(
          'The trait of the scheduled node needs to correspond to the trait of the flavor used by the ironic instance; by injecting the necessary traits into the ironic instance, the computing service will only schedule the instance to the bare metal node with all the necessary traits (for example, the ironic instance which use the flavor that has HW_CPU_X86_VMX as a necessary trait, can be scheduled to the node which has the trait of HW_CPU_X86_VMX).'
        ),
      },
      {
        name: 'custom_trait',
        label: t('Custom Trait'),
        type: 'add-select',
        isInput: true,
        extra: (
          <div>
            <p>
              {t(
                '1. The name of the trait should start with CUSTOM_, can only contain uppercase letters A ~ Z, numbers 0 ~ 9 or underscores, and the length should not exceed 255 characters (for example: CUSTOM_TRAIT1).'
              )}
            </p>
            <p>
              {t(
                '2. The trait of the scheduled node needs to correspond to the trait of the flavor used by the ironic instance; by injecting the necessary traits into the ironic instance, the computing service will only schedule the instance to the bare metal node with all the necessary traits (for example, the ironic instance which use the flavor that has CUSTOM_TRAIT1 as a necessary trait, can be scheduled to the node which has the trait of CUSTOM_TRAIT1).'
              )}
            </p>
          </div>
        ),
        validator: (rule, value) => {
          if (!this.checkCustomTrait(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(t('Please enter right format custom trait!'));
          }
          return Promise.resolve();
        },
      },
      {
        name: 'resource_class',
        label: t('Resource Class'),
        type: 'input',
        extra: t(
          'The resource class of the scheduled node needs to correspond to the resource class name of the flavor used by the ironic instance (for example, the resource class name of the scheduling node is baremetal.with-GPU, and the custom resource class name of the flavor is CUSTOM_BAREMETAL_WITH_GPU=1).'
        ),
      },
    ];
  }
}

export default inject('rootStore')(observer(NodeInfo));
