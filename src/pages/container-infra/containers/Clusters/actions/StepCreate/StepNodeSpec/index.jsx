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
import Base from 'components/Form';
import globalKeypairStore from 'stores/nova/keypair';
import { FlavorStore } from 'src/stores/nova/flavor';
import { defaultTip } from 'resources/magnum/cluster';
import { getKeyPairHeader } from 'resources/nova/keypair';
import { getBaseSimpleFlavorColumns } from 'resources/magnum/template';

export class StepNodeSpec extends Base {
  init() {
    this.keyPairStore = globalKeypairStore;
    this.flavorStore = new FlavorStore();
    this.masterFlavorStore = new FlavorStore();
    this.getAllInitFunctions();
  }

  get title() {
    return t('Node Spec');
  }

  get name() {
    return t('Node Spec');
  }

  allowed = () => Promise.resolve();

  async getAllInitFunctions() {
    await Promise.all([
      this.getKeypairs(),
      this.getFlavors(),
      this.getMasterFlavors(),
    ]);
    this.updateDefaultValue();
  }

  getKeypairs() {
    return this.keyPairStore.fetchList();
  }

  get keypairs() {
    return this.keyPairStore.list.data || [];
  }

  getFlavors() {
    return this.flavorStore.fetchList();
  }

  getMasterFlavors() {
    return this.masterFlavorStore.fetchList();
  }

  get flavors() {
    return toJS(this.flavorStore.list.data) || [];
  }

  get masterFlavors() {
    return toJS(this.masterFlavorStore.list.data) || [];
  }

  get defaultValue() {
    const {
      context: { clusterTemplate = {}, keypair, masterFlavor, flavor } = {},
    } = this.props;
    const { selectedRows = [] } = clusterTemplate;
    const { master_flavor_id, flavor_id, keypair_id, selfKeypair } =
      selectedRows[0] || {};

    return {
      master_count: 1,
      node_count: 1,
      masterFlavor: masterFlavor || {
        selectedRowKeys: master_flavor_id ? [master_flavor_id] : [],
        selectedRows: this.masterFlavors.filter(
          (it) => it.id === master_flavor_id
        ),
      },
      flavor: flavor || {
        selectedRowKeys: flavor_id ? [flavor_id] : [],
        selectedRows: this.flavors.filter((it) => it.id === flavor_id),
      },
      keypair: keypair || {
        selectedRowKeys: keypair_id && selfKeypair ? [keypair_id] : [],
        selectedRows: this.keypairs.filter((it) => it.id === keypair_id),
      },
    };
  }

  get formItems() {
    const {
      context: { clusterTemplate = {}, keypair, masterFlavor, flavor } = {},
    } = this.props;
    const { selectedRows = [] } = clusterTemplate;
    const { master_flavor_id, flavor_id, keypair_id, selfKeypair } =
      selectedRows[0] || {};
    const { initKeyPair = keypair } = this.state;
    const templateHasSelfKeypair = keypair_id && selfKeypair;
    const templateInitKeypair = {
      selectedRowKeys: keypair_id && selfKeypair ? [keypair_id] : [],
      selectedRows: this.keypairs.filter((it) => it.id === keypair_id),
    };

    const initFlavor = flavor || {
      selectedRowKeys: flavor_id ? [flavor_id] : [],
      selectedRows: this.flavors.filter((it) => it.id === flavor_id),
    };
    const initMasterFlavor = masterFlavor || {
      selectedRowKeys: master_flavor_id ? [master_flavor_id] : [],
      selectedRows: this.masterFlavors.filter(
        (it) => it.id === master_flavor_id
      ),
    };

    return [
      {
        name: 'keypair',
        label: t('Keypair'),
        type: 'select-table',
        required: true,
        data: this.keypairs,
        initValue:
          initKeyPair || (templateHasSelfKeypair && templateInitKeypair),
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
        required: true,
        tip: defaultTip,
        data: this.masterFlavors,
        initValue: initMasterFlavor,
        columns: getBaseSimpleFlavorColumns(this),
        isLoading: this.masterFlavorStore.list.isLoading,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        onChange: (value) => {
          this.updateContext({
            masterFlavor: value,
          });
        },
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
        required: true,
        tip: defaultTip,
        data: this.flavors,
        initValue: initFlavor,
        columns: getBaseSimpleFlavorColumns(this),
        isLoading: this.flavorStore.list.isLoading,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        onChange: (value) => {
          this.updateContext({
            flavor: value,
          });
        },
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNodeSpec));
