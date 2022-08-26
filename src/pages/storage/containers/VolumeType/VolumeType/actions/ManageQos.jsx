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
import { consumerTypes } from 'resources/cinder/volume-type';
import globalQosSpecStore from 'stores/cinder/qos-spec';

export class ManageQos extends ModalAction {
  static id = 'manage-qos';

  static title = t('Manage QoS Spec');

  get name() {
    return t('manage qos spec');
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  init() {
    this.store = globalQosSpecStore;
    this.getQos();
  }

  getQos() {
    this.store.fetchList();
  }

  get QosMap() {
    return (this.store.list.data || []).map((s) => ({ ...s, key: s.id }));
  }

  static policy = 'volume_extension:qos_specs_manage:update';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const { name } = this.item;
    const value = {
      volumeType: name,
      qosSpec: {
        selectedRowKeys: this.item.qos_specs_id ? [this.item.qos_specs_id] : [],
      },
    };
    return value;
  }

  get formItems() {
    return [
      {
        name: 'volumeType',
        label: t('Volume Type'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'qosSpec',
        label: t('QoS Spec'),
        type: 'select-table',
        required: false,
        data: this.QosMap,
        isLoading: this.store.list.isLoading,
        isMulti: false,
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
            title: t('Consumer'),
            dataIndex: 'consumer',
            valueMap: consumerTypes,
          },
          {
            title: t('Specs'),
            dataIndex: 'specs',
            render: (value) => {
              if (value && JSON.stringify(value) !== '{}') {
                return Object.entries(value).map(([key, val]) => {
                  return (
                    <div key={key}>
                      {key}={val}
                    </div>
                  );
                });
              }
              return '-';
            },
          },
        ],
      },
    ];
  }

  onSubmit = (values) => {
    const { id, qos_specs_id } = this.item;
    const { qosSpec } = values;
    const qosId = qosSpec.selectedRowKeys[0];
    return this.store.updateVolumeTypeQos(qosId, qos_specs_id, {
      vol_type_id: id,
    });
  };
}

export default inject('rootStore')(observer(ManageQos));
