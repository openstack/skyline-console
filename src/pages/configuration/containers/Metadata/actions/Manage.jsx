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
import { toJS } from 'mobx';
import { MetadataStore } from 'stores/glance/metadata';
import { ModalAction } from 'containers/Action';
import { Input } from 'antd';

export class Manage extends ModalAction {
  static id = 'manage';

  static title = t('Manage Resource Types');

  init() {
    this.store = new MetadataStore();
    this.getResourceTypes();
  }

  get name() {
    return t('manage resource types');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  getResourceTypes() {
    this.store.fetchResourceTypes(this.item);
  }

  get resourceTypes() {
    return (this.store.resourceTypes || []).map((it) => ({
      ...it,
      id: it.name,
    }));
  }

  static policy = [
    'list_metadef_resource_types',
    'add_metadef_resource_type_association',
    'remove_metadef_resource_type_association',
  ];

  static allowed = (item) => Promise.resolve(!item.protected);

  get defaultValue() {
    const { namespace, resource_type_associations: associations = [] } =
      this.item;
    return {
      namespace,
      associations: {
        selectedRowKeys: associations.map((it) => it.name),
      },
    };
  }

  updatePrefix = (value, record) => {
    const { name } = record;
    record.prefix = value;
    const resourceTypes = toJS(this.store.resourceTypes);
    resourceTypes.forEach((it) => {
      if (it.name === name) {
        it.prefix = value;
      }
    });
    this.store.resourceTypes = resourceTypes;
  };

  renderInput = (value, record) => {
    const placeholder = t('Please input prefix');
    return (
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          this.updatePrefix(e.currentTarget.value, record);
        }}
        onClick={(e) => {
          e && e.stopPropagation();
        }}
      />
    );
  };

  get formItems() {
    return [
      {
        name: 'namespace',
        label: t('Namespace'),
        iconType: 'metadata',
        type: 'label',
      },
      {
        name: 'associations',
        label: t('Resource Types'),
        type: 'select-table',
        data: this.resourceTypes,
        isLoading: this.store.resourceTypeLoading,
        isMulti: true,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Prefix'),
            dataIndex: 'prefix',
            render: (value, record) => this.renderInput(value, record),
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { associations = {} } = values;
    const { selectedRowKeys = [] } = associations;
    const { resource_type_associations: oldItems = [], namespace } = this.item;
    const mapper = {};
    const newMapper = {};
    const oldMapper = {};
    const dels = [];
    const adds = [];
    this.resourceTypes.forEach((it) => {
      it.prefix = it.prefix || '';
      mapper[it.name] = it;
    });
    const newItems = selectedRowKeys.map((key) => {
      newMapper[key] = mapper[key];
      return {
        name: key,
        prefix: mapper[key].prefix || '',
      };
    });
    oldItems.forEach((it) => {
      oldMapper[it.name] = it;
      if (!newMapper[it.name]) {
        dels.push(it);
      } else if (newMapper[it.name].prefix !== it.prefix) {
        dels.push(it);
      }
    });
    newItems.forEach((it) => {
      if (!oldMapper[it.name]) {
        adds.push(it);
      } else if (oldMapper[it.name].prefix !== it.prefix) {
        adds.push(it);
      }
    });
    if (adds.length === 0 && dels.length === 0) {
      return Promise.resolve();
    }
    return this.store.manageResourceTypes(namespace, dels, adds);
  };
}

export default inject('rootStore')(observer(Manage));
