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
import FlavorSelectTable from 'src/pages/compute/containers/Instance/components/FlavorSelectTable';
import globalKeypairStore from 'stores/nova/keypair';
import { defaultTip } from 'resources/magnum/cluster';
import { getKeyPairHeader } from 'resources/nova/keypair';

export class StepNodeSpec extends Base {
  init() {
    this.keyPairStore = globalKeypairStore;
    this.getKeypairs();
  }

  get title() {
    return t('Node Spec');
  }

  get name() {
    return t('Node Spec');
  }

  allowed = () => Promise.resolve();

  async getKeypairs() {
    await this.keyPairStore.fetchList();
  }

  get keypairs() {
    return this.keyPairStore.list.data || [];
  }

  getFlavorComponent() {
    return <FlavorSelectTable onChange={this.onFlavorChange} />;
  }

  onFlavorChange = (value) => {
    this.updateContext({
      flavor: value,
    });
  };

  getMasterFlavorComponent() {
    return <FlavorSelectTable onChange={this.onMasterFlavorChange} />;
  }

  onMasterFlavorChange = (value) => {
    this.updateContext({
      masterFlavor: value,
    });
  };

  get defaultValue() {
    return {
      master_count: 1,
      node_count: 1,
    };
  }

  get formItems() {
    const { context: { clusterTemplate = {} } = {} } = this.props;
    const { selectedRows = [] } = clusterTemplate;
    const { master_flavor_id, flavor_id, keypair_id } = selectedRows[0] || {};
    const { initKeyPair } = this.state;

    return [
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
      {
        name: 'master_count',
        label: t('Number of Master Nodes'),
        type: 'input-int',
        min: 1,
        required: true,
        onChange: (value) => {
          this.updateContext({
            master_count: value,
          });
        },
      },
      {
        name: 'masterFlavor',
        label: t('Flavor of Master Nodes'),
        type: 'select-table',
        component: this.getMasterFlavorComponent(),
        required: !master_flavor_id,
        tip: defaultTip,
      },
      {
        type: 'divider',
      },
      {
        name: 'node_count',
        label: t('Number of Nodes'),
        type: 'input-int',
        min: 1,
        required: true,
        onChange: (value) => {
          this.updateContext({
            node_count: value,
          });
        },
      },
      {
        name: 'flavor',
        label: t('Flavor of Nodes'),
        type: 'select-table',
        component: this.getFlavorComponent(),
        required: !flavor_id,
        tip: defaultTip,
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNodeSpec));
