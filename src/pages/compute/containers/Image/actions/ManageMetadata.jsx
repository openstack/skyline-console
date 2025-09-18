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
import { toJS } from 'mobx';
import { has, isEmpty } from 'lodash';
import globalImageStore from 'stores/glance/image';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { ModalAction } from 'containers/Action';
import { MetadataStore } from 'stores/glance/metadata';
import { isOwner } from 'resources/glance/image';
import { normalizeImageSystemMetadata } from 'utils/image';

const HIDDEN_KEYS = [
  'os_hash_algo',
  'os_hash_value',
  'direct_url',
  'locations',
];

export class ManageMetadata extends ModalAction {
  init() {
    this.store = globalImageStore;
    this.metadataStore = new MetadataStore();
  }

  static id = 'ManageMetadata';

  static title = t('Manage Metadata');

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get name() {
    return t('Manage Metadata');
  }

  get wrapperCol() {
    return {
      xs: { span: 18 },
      sm: { span: 20 },
    };
  }

  static policy = 'modify_image';

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(isOwner(item) || isAdminPage);
  };

  get metadata() {
    // MetadataTransfer expects an array of metadata schema objects
    // For now, return empty array to prevent errors
    // TODO: We'll need to implement proper metadata schema fetching
    return [];
  }

  get existingMetadata() {
    const { item } = this.props;
    return item.imageMetadata || {};
  }

  get nonStringFieldKeys() {
    const existingMetadata = this.existingMetadata || {};
    return Object.keys(existingMetadata).filter(
      (key) => typeof existingMetadata[key] !== 'string'
    );
  }

  getExistingMetadataKeys() {
    const existingMetadata = this.existingMetadata || {};
    return Object.keys(existingMetadata);
  }

  getNonStringFieldKeys() {
    return this.nonStringFieldKeys || [];
  }

  parseExistMetadata() {
    const customs = [];
    const systems = [];

    const existingMetadata = this.existingMetadata || {};

    if (Object.keys(existingMetadata).length > 0) {
      Object.entries(existingMetadata).forEach(([key, value]) => {
        if (typeof value === 'string' && !HIDDEN_KEYS.includes(key)) {
          systems.push({
            index: systems.length,
            value: { key, value: toJS(value) },
          });
        }
      });
    }

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

  isCustomMetadataFilled = (values = []) => {
    if (isEmpty(values)) return true;

    return values.every((item) => {
      const { key, value } = item.value || {};
      return key && value !== undefined && value !== null;
    });
  };

  isCustomMetadataUnique = (values = []) => {
    const keys = values.map((item) => item.value?.key);
    const uniqueKeys = new Set(keys);

    return keys.length === uniqueKeys.size;
  };

  isCustomMetadataNew = (values = []) => {
    const existingKeys = new Set(this.getExistingMetadataKeys());

    return values.every((item) => {
      const { key } = item.value || {};
      return !existingKeys.has(key);
    });
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
        name: 'systems',
        label: t('Existing Metadata'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        keySpan: 8,
        valueSpan: 10,
        readonlyKeys: this.getExistingMetadataKeys(),
        hideAddButton: true,
      },
      {
        name: 'customs',
        label: t('Add New Metadata'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        keySpan: 8,
        valueSpan: 10,
        validator: (_, value) => {
          if (!this.isCustomMetadataFilled(value)) {
            return Promise.reject(t('Please input key and value'));
          }
          if (!this.isCustomMetadataUnique(value)) {
            return Promise.reject(t('Metadata key must be unique'));
          }
          if (!this.isCustomMetadataNew(value)) {
            return Promise.reject(t('Metadata key already exists'));
          }
          return Promise.resolve();
        },
      },
    ];
  }

  onSubmit = (values) => {
    const { systems: prevSystemsArray } = this.parseExistMetadata();
    const { customs, systems: nextSystemsArray } = values;

    const prevSystems = normalizeImageSystemMetadata(prevSystemsArray);
    const nextSystems = normalizeImageSystemMetadata(nextSystemsArray);

    const adds = [];
    const removes = [];
    const replaces = [];

    customs.forEach((item) => {
      const { key, value } = item.value || {};
      const prevValue = prevSystems[key];

      if (prevValue === undefined) {
        adds.push({ key, value });
      } else if (prevValue !== value) {
        replaces.push({ key, value });
      }
    });

    Object.keys(nextSystems).forEach((key) => {
      if (!has(prevSystems, key)) {
        adds.push({ key, value: nextSystems[key] });
      } else if (nextSystems[key] !== prevSystems[key]) {
        replaces.push({ key, value: nextSystems[key] });
      }
    });

    Object.keys(prevSystems).forEach((key) => {
      if (!has(nextSystems, key)) {
        removes.push(key);
      }
    });

    const metadataChanges = [
      ...adds.map((item) => ({
        op: 'add',
        path: `/${item.key}`,
        value: item.value,
      })),
      ...replaces.map((item) => ({
        op: 'replace',
        path: `/${item.key}`,
        value: item.value,
      })),
      ...removes.map((key) => ({
        op: 'remove',
        path: `/${key}`,
      })),
    ];

    if (metadataChanges.length === 0) {
      return Promise.resolve();
    }
    return this.store.update({ id: this.item.id }, metadataChanges);
  };
}

export default inject('rootStore')(observer(ManageMetadata));
