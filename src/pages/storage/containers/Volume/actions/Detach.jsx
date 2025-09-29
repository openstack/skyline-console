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

// import React from 'react';
import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalServerStore from 'stores/nova/instance';
import { ServerGroupInstanceStore } from 'stores/skyline/server-group-instance';
import { isInUse, isOsDisk } from 'resources/cinder/volume';
import {
  instanceColumnsBackend,
  allowAttachVolumeInstance,
} from 'resources/nova/instance';

export class Detach extends ModalAction {
  static id = 'detach';

  static title = t('Detach');

  static isDanger = true;

  get name() {
    return t('Detach');
  }

  init() {
    this.store = globalServerStore;
    this.instanceStore = new ServerGroupInstanceStore();
    this.getInstances();
    this.state.autoSelectInstance = null;
  }

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  get instances() {
    return this.instanceStore.list.data || [];
  }

  async getInstances() {
    const members = (this.item.attachments || []).map((it) => it.server_id);
    await this.instanceStore.fetchList({ members });

    if (this.instances && this.instances.length === 1) {
      const [{ id }] = this.instances;
      const selected = { selectedRowKeys: [id] };

      this.setState({ autoSelectInstance: selected }, () => {
        const setForm = () =>
          this.formRef?.current?.setFieldsValue({ instance: selected });
        if (!setForm()) {
          Promise.resolve().then(setForm);
        }
      });
    }
  }

  get defaultValue() {
    const { name, size, volume_type } = this.item;
    const value = {
      volume: `${name}(${volume_type} | ${size}GiB)`,
    };
    return value;
  }

  static policy = 'os_compute_api:os-volumes-attachments:delete';

  static allowed = (item) =>
    Promise.resolve(
      isInUse(item) &&
        !isOsDisk(item) &&
        Array.isArray(item.attachments) &&
        item.attachments.length
    );

  disabledInstance = (ins) => !allowAttachVolumeInstance(ins);

  get formItems() {
    const { autoSelectInstance } = this.state;
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'instance',
        label: t('Instance'),
        type: 'select-table',
        required: true,
        data: this.instances,
        initValue: autoSelectInstance || {},
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: instanceColumnsBackend,
        isLoading: this.instanceStore.list.isLoading,
        disabledFunc: this.disabledInstance,
      },
    ];
  }

  onSubmit = ({ instance }) => {
    const { id } = this.item;
    const { selectedRowKeys } = instance;
    const instanceId = selectedRowKeys[0];
    return this.store.detachVolume({ id: instanceId, volumes: [id] });
  };
}

export default inject('rootStore')(observer(Detach));
