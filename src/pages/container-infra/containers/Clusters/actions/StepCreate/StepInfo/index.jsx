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

export class StepInfo extends Base {
  init() {
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
    await globalKeypairStore.fetchList();
  }

  get keypairs() {
    return globalKeypairStore.list.data || [];
  }

  handleTemplateChange = (e) => {
    const { selectedRows = [] } = e;
    this.setState({
      clusterTemplate: selectedRows[0],
    });
  };

  get defaultValue() {
    const { template } = this.locationParams;
    if (template) {
      return {
        clusterTemplate: { selectedRowKeys: [template] },
      };
    }
    return {};
  }

  get formItems() {
    const { clusterTemplate } = this.state;
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
        onChange: this.handleTemplateChange,
      },
      {
        name: 'keypair',
        label: t('Keypair'),
        type: 'select-table',
        required: !keypair_id,
        data: this.keypairs,
        isLoading: globalKeypairStore.list.isLoading,
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
