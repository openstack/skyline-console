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
import Base from 'components/Form';
import { toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import { defaultTip } from 'resources/magnum/cluster';
import { NetworkStore } from 'stores/neutron/network';
import { SubnetStore } from 'src/stores/neutron/subnet';
import { ClusterTemplatesStore } from 'stores/magnum/clusterTemplates';
import { networkColumns, subnetColumns } from 'resources/neutron/network';
import { getLinkRender } from 'utils/route-map';
import { allSettled } from 'utils';

export class StepNetworks extends Base {
  init() {
    this.templateStore = new ClusterTemplatesStore();
    this.networkStore = new NetworkStore();
    this.subnetStore = new SubnetStore();
    this.getAllInitFunctions();
  }

  get title() {
    return t('Cluster Network');
  }

  get name() {
    return t('Cluster Network');
  }

  allowed = () => Promise.resolve();

  async getAllInitFunctions() {
    await allSettled([this.subnetStore.fetchList(), this.getTemplateDetail()]);
    const { fixed_network, fixed_subnet } = this.templateDetail;

    await allSettled([
      fixed_network
        ? this.networkStore.fetchDetail({ id: fixed_network })
        : null,
      fixed_subnet ? this.subnetStore.fetchDetail({ id: fixed_subnet }) : null,
    ]);
    this.updateDefaultValue();
  }

  getTemplateDetail() {
    const { context: { clusterTemplate = {} } = {} } = this.props;
    const { selectedRowKeys = [] } = clusterTemplate;
    const templateId = selectedRowKeys[0];
    if (templateId) {
      return this.templateStore.fetchDetail({ id: templateId });
    }
  }

  get network() {
    return toJS(this.networkStore.detail) || {};
  }

  get subnet() {
    return toJS(this.subnetStore.detail) || {};
  }

  get subnetList() {
    const {
      context: { fixedNetwork: { selectedRowKeys: contextKeys = [] } = {} },
    } = this.props;
    const { fixed_network } = this.templateDetail;
    const key = contextKeys[0] || fixed_network;

    return toJS(this.subnetStore.list.data || []).filter(
      (it) => key === it.network_id
    );
  }

  get templateDetail() {
    return toJS(this.templateStore.detail) || {};
  }

  get defaultValue() {
    const { context: { fixedNetwork, fixedSubnet } = {} } = this.props;
    const { fixed_network, fixed_subnet } = this.templateDetail;

    return {
      newNetwork: true,
      fixedNetwork: fixedNetwork || {
        selectedRowKeys: fixed_network ? [fixed_network] : [],
        selectedRows: fixed_network ? [this.network] : [],
      },
      fixedSubnet: fixedSubnet || {
        selectedRowKeys: fixed_subnet ? [fixed_subnet] : [],
        selectedRows: fixed_subnet ? [this.subnet] : [],
      },
    };
  }

  get nameForStateUpdate() {
    return ['newNetwork'];
  }

  get formItems() {
    const { newNetwork } = this.state;

    const { context: { fixedNetwork, fixedSubnet } = {} } = this.props;
    const { fixed_network, fixed_subnet } = this.templateDetail;

    const initFixedNetwork = fixedNetwork || {
      selectedRowKeys: fixed_network ? [fixed_network] : [],
      selectedRows: fixed_network ? [this.network] : [],
    };
    const initSubnet = fixedSubnet || {
      selectedRowKeys: fixed_subnet ? [fixed_subnet] : [],
      selectedRows: fixed_subnet ? [this.subnet] : [],
    };

    return [
      {
        name: 'master_lb_enabled',
        label: t('Enable Load Balancer'),
        type: 'check',
        content: t('Enabled Load Balancer for Master Nodes'),
        tip: defaultTip,
      },
      {
        name: 'newNetwork',
        label: t('Enabled Network'),
        type: 'check',
        content: t('Create New Network'),
      },
      {
        name: 'fixedNetwork',
        label: t('Fixed Network'),
        type: 'select-table',
        hidden: newNetwork,
        backendPageStore: this.networkStore,
        extraParams: {
          'router:external': false,
          project_id: this.currentProjectId,
        },
        loading: this.networkStore.list.isLoading,
        header: (
          <div>
            {t(' You can go to the console to ')}
            {getLinkRender({
              key: 'network',
              value: `${t('create a new network/subnet')} > `,
              extra: { target: '_blank' },
            })}
          </div>
        ),
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: networkColumns(this),
        onChange: (value) => {
          this.updateContext({
            fixedNetwork: value,
            fixedSubnet: {
              selectedRowKeys: [],
              selectedRows: [],
            },
          });
        },
        initValue: initFixedNetwork,
      },
      {
        name: 'fixedSubnet',
        label: t('Fixed Subnet'),
        type: 'select-table',
        hidden: newNetwork,
        data: this.subnetList,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: subnetColumns,
        onChange: (value) => {
          this.updateContext({
            fixedSubnet: value,
          });
        },
        initValue: initSubnet,
      },
      {
        type: 'divider',
      },
      {
        name: 'floating_ip_enabled',
        label: t('Enable Floating IP'),
        type: 'check',
        tip: defaultTip,
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNetworks));
