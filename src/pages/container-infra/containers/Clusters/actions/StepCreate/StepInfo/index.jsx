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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import globalClusterTemplateStore from 'stores/magnum/clusterTemplates';
import globalKeypairStore from 'stores/nova/keypair';
import { getBaseTemplateColumns } from 'resources/magnum/template';
import { getKeyPairHeader } from 'resources/nova/keypair';

export class StepInfo extends Base {
  init() {
    this.keyPairStore = globalKeypairStore;
    this.getClustertemplates();
    this.getKeypairs();
  }

  get title() {
    return t('Info');
  }

  get name() {
    return t('Info');
  }

  async getClustertemplates() {
    await globalClusterTemplateStore.fetchList();
    this.updateDefaultValue();
    this.updateState();
  }

  get clusterTemplates() {
    const templates = globalClusterTemplateStore.list.data || [];
    const { template } = this.locationParams;
    if (template) {
      return templates.filter((it) => it.uuid === template);
    }
    return templates;
  }

  async getKeypairs() {
    await this.keyPairStore.fetchList();
  }

  get keypairs() {
    return this.keyPairStore.list.data || [];
  }

  get nameForStateUpdate() {
    return ['clusterTemplate'];
  }

  get defaultValue() {
    const values = {};
    const { initKeyPair } = this.state;
    if (initKeyPair) {
      values.keypairs = initKeyPair;
    }

    const { template } = this.locationParams;
    if (template) {
      values.clusterTemplate = {
        selectedRowKeys: [template],
        selectedRows: this.clusterTemplates,
      };
    }

    return values;
  }

  get formItems() {
    const { clusterTemplate, initKeyPair } = this.state;
    const { keypair_id } = clusterTemplate || {};

    return [
      {
        name: 'name',
        label: t('Cluster Name'),
        type: 'input',
        placeholder: t('Cluster Name'),
        required: true,
      },
      {
        name: 'clusterTemplate',
        label: t('Cluster Template'),
        type: 'select-table',
        data: this.clusterTemplates,
        isLoading: globalClusterTemplateStore.list.isLoading,
        required: true,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getBaseTemplateColumns(this),
      },
      {
        name: 'keypair',
        label: t('Keypair'),
        type: 'select-table',
        required: !keypair_id,
        data: this.keypairs,
        initValue: initKeyPair,
        isLoading: this.keyPairStore.list.isLoading,
        header: getKeyPairHeader(this),
        tip: t(
          'The SSH key is a way to remotely log in to the cluster instance. If it’s not set, the value of this in template will be used.'
        ),
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
            title: t('Fingerprint'),
            dataIndex: 'fingerprint',
          },
        ],
      },
    ];
  }
}

export default inject('rootStore')(observer(StepInfo));
