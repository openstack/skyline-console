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
import globalFlavorStore from 'stores/nova/flavor';
import { ModalAction } from 'containers/Action';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { MetadataStore } from 'stores/glance/metadata';
import { isEmpty, has } from 'lodash';

export class ManageMetadata extends ModalAction {
  static id = 'ManageMetadata';

  static title = t('Manage Metadata');

  init() {
    this.store = globalFlavorStore;
    this.metadataStore = new MetadataStore();
    this.getMetadata();
  }

  get name() {
    return t('Manage Metadata');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get wrapperCol() {
    return {
      xs: { span: 18 },
      sm: { span: 20 },
    };
  }

  static policy = [
    'os_compute_api:os-flavor-extra-specs:create',
    'os_compute_api:os-flavor-extra-specs:delete',
    'os_compute_api:os-flavor-extra-specs:update',
  ];

  static allowed = () => Promise.resolve(true);

  async getMetadata() {
    const resourceType = 'OS::Nova::Flavor';
    await this.metadataStore.fetchList({
      manage: true,
      resource_types: resourceType,
    });
    this.updateDefaultValue();
  }

  get systemMetadata() {
    return this.metadataStore.list.data || [];
  }

  checkKeyInSystem = (key) => {
    const metadata = this.systemMetadata.find((it) => {
      const { detail: { properties = {} } = {} } = it;
      return Object.keys(properties).indexOf(key) >= 0;
    });
    return !!metadata;
  };

  getItemMetadata() {
    const { extra_specs = {}, originData = {} } = this.item || {};
    return isEmpty(originData) ? extra_specs : originData.extra_specs || {};
  }

  parseExistMetadata() {
    const customs = [];
    const systems = {};
    const metadata = this.getItemMetadata();
    Object.keys(metadata).forEach((key) => {
      if (this.checkKeyInSystem(key)) {
        systems[key] = metadata[key];
      } else {
        customs.push({
          index: customs.length,
          value: { key, value: metadata[key] },
        });
      }
    });
    return {
      customs,
      systems,
    };
  }

  get defaultValue() {
    const { name } = this.item;
    const { customs, systems } = this.parseExistMetadata();
    const value = {
      name,
      customs,
      systems,
    };
    return value;
  }

  checkCustoms = (values) => {
    if (isEmpty(values)) {
      return true;
    }
    const item = values.find((it) => {
      const { key, value } = it.value || {};
      return !key || value === undefined || value === null;
    });
    return !item;
  };

  hasNoValue = (values) => {
    const item = Object.keys(values).find((it) => values[it] === undefined);
    return !!item;
  };

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'label',
        iconType: 'aggregate',
      },
      {
        name: 'customs',
        label: t('Custom Metadata'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('New Custom Metadata'),
        validator: (rule, value) => {
          if (!this.checkCustoms(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(t('Please enter complete key value!'));
          }
          return Promise.resolve();
        },
      },
      {
        name: 'systems',
        label: t('System Metadata'),
        type: 'metadata-transfer',
        metadata: this.systemMetadata,
        validator: (rule, value) => {
          if (this.hasNoValue(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(t('Please input value'));
          }
          return Promise.resolve();
        },
      },
    ];
  }

  onSubmit = (values) => {
    const { customs: oldCustoms, systems: oldSystems } =
      this.parseExistMetadata();
    const { customs, systems } = values;
    const adds = [];
    const removes = [];
    const replaces = [];
    customs.forEach((it) => {
      const { key, value } = it.value || {};
      const oldItem = oldCustoms.find((c) => c.value.key === key);
      if (!oldItem) {
        adds.push(it.value);
      } else if (oldItem.value.value !== value) {
        replaces.push(it.value);
      }
    });
    Object.keys(systems).forEach((key) => {
      const item = {
        key,
        value: systems[key],
      };
      if (!has(oldSystems, key)) {
        adds.push(item);
      } else if (systems[key] !== oldSystems[key]) {
        replaces.push(item);
      }
    });
    oldCustoms.forEach((it) => {
      const item = customs.find((custom) => custom.value.key === it.value.key);
      if (!item) {
        removes.push(it.value.key);
      }
    });
    Object.keys(oldSystems).forEach((key) => {
      if (!has(systems, key)) {
        removes.push(key);
      }
    });
    return this.store.updateExtraSpecs(this.item.id, adds, replaces, removes);
  };
}

export default inject('rootStore')(observer(ManageMetadata));
