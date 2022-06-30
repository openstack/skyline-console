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
import { StepAction } from 'src/containers/Action';
import globalClustersStore from 'src/stores/magnum/clusters';
import StepInfo from './StepInfo';
import StepNodeSpec from './StepNodeSpec';
import StepNetworks from './StepNetworks';
import StepManagement from './StepManagement';
import StepLabel from './StepLabel';

export class StepCreate extends StepAction {
  init() {
    this.store = globalClustersStore;
  }

  static id = 'create-cluster';

  static title = t('Create Cluster');

  static path = '/container-infra/clusters/create';

  static policy = 'cluster:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Instance');
  }

  get listUrl() {
    return this.getRoutePath('containerInfraClusters');
  }

  get hasConfirmStep() {
    return false;
  }

  get steps() {
    return [
      {
        title: t('Info *'),
        component: StepInfo,
      },
      {
        title: t('Node Spec *'),
        component: StepNodeSpec,
      },
      {
        title: t('Networks'),
        component: StepNetworks,
      },
      {
        title: t('Management'),
        component: StepManagement,
      },
      {
        title: t('Labels'),
        component: StepLabel,
      },
    ];
  }

  onSubmit = (values) => {
    const {
      additionalLabels,
      clusterTemplate,
      keypair,
      auto_healing_enabled,
      auto_scaling_enabled,
      newNetwork,
      fixed_network,
      flavor,
      masterFlavor,
      ...rest
    } = values;
    const requestLabels = {};

    if (additionalLabels) {
      additionalLabels.forEach((item) => {
        const labelKey = item.value.key.toLowerCase().trim();
        const labelValue = item.value.value.toLowerCase().trim();
        requestLabels[labelKey] = labelValue;
      });
    }

    const data = {
      name: values.name,
      labels: {
        ...requestLabels,
        auto_healing_enabled: `${auto_healing_enabled}`,
        auto_scaling_enabled: `${auto_scaling_enabled}`,
      },
      master_flavor_id: masterFlavor.selectedRowKeys[0],
      flavor_id: flavor.selectedRowKeys[0],
      cluster_template_id: clusterTemplate.selectedRowKeys[0],
      keypair: keypair.selectedRowKeys[0],
      ...rest,
    };

    if (!newNetwork && fixed_network) {
      const { selectedRowKeys = [] } = fixed_network;
      data.fixed_network = selectedRowKeys[0];
    }

    return this.store.create(data);
  };
}

export default inject('rootStore')(observer(StepCreate));
