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
import { StepAction } from 'src/containers/Action';
import globalClustersStore from 'src/stores/magnum/clusters';
import globalProjectStore from 'stores/keystone/project';
import globalFlavorStore from 'stores/nova/flavor';
import { getGiBValue } from 'utils';
import { message as $message } from 'antd';
import StepInfo from './StepInfo';
import StepNodeSpec from './StepNodeSpec';
import StepNetworks from './StepNetworks';
import StepManagement from './StepManagement';
import StepLabel from './StepLabel';

export class StepCreate extends StepAction {
  init() {
    this.store = globalClustersStore;
    this.projectStore = globalProjectStore;
    this.state.quotaLoading = true;
    this.getQuota();
    this.errorMsg = '';
  }

  static id = 'create-cluster';

  static title = t('Create Cluster');

  static path = '/container-infra/clusters/create';

  static policy = 'cluster:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Cluster');
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
        title: t('Cluster Info'),
        component: StepInfo,
      },
      {
        title: t('Node Spec'),
        component: StepNodeSpec,
      },
      {
        title: t('Network Setting'),
        component: StepNetworks,
      },
      {
        title: t('Management'),
        component: StepManagement,
      },
      {
        title: t('Additional Labels'),
        component: StepLabel,
      },
    ];
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  get flavors() {
    return toJS(globalFlavorStore.list.data) || [];
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    this.setState({
      quotaLoading: true,
    });
    await Promise.all([
      this.projectStore.fetchProjectNovaQuota(),
      this.projectStore.fetchProjectMagnumQuota(),
      this.enableCinder ? this.projectStore.fetchProjectCinderQuota() : null,
    ]);
    this.setState({
      quotaLoading: false,
    });
  }

  get disableNext() {
    return !!this.errorMsg;
  }

  get disableSubmit() {
    return !!this.errorMsg;
  }

  get quotaInfo() {
    const { quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    const quotaError = this.checkQuotaInput();

    const { magnum_cluster = {} } = toJS(this.projectStore.magnumQuota) || {};
    const clusterQuotaInfo = {
      ...magnum_cluster,
      add: quotaError ? 0 : 1,
      name: 'cluster',
      title: t('Clusters'),
    };

    const { newNodes } = this.getNodesInput();
    const {
      instances = {},
      cores = {},
      ram = {},
    } = toJS(this.projectStore.novaQuota) || {};
    const instanceQuotaInfo = {
      ...instances,
      add: quotaError ? 0 : newNodes,
      name: 'instance',
      title: t('Instance'),
      type: 'line',
    };

    const { newCPU, newRam } = this.getFlavorInput();
    const cpuQuotaInfo = {
      ...cores,
      add: quotaError ? 0 : newCPU,
      name: 'cpu',
      title: t('CPU'),
      type: 'line',
    };

    const ramQuotaInfo = {
      ...ram,
      add: quotaError ? 0 : newRam,
      name: 'ram',
      title: t('Memory (GiB)'),
      type: 'line',
    };

    const { volumes } = toJS(this.projectStore.cinderQuota) || {};
    const volumeQuotaInfo = {
      ...volumes,
      add: quotaError ? 0 : newNodes,
      name: 'volume',
      title: t('Volume'),
      type: 'line',
    };

    const quotaInfo = [
      clusterQuotaInfo,
      instanceQuotaInfo,
      cpuQuotaInfo,
      ramQuotaInfo,
      volumeQuotaInfo,
    ];

    return quotaInfo;
  }

  checkClusterQuota() {
    const { quotaLoading } = this.state;
    if (quotaLoading) {
      return '';
    }
    const { magnum_cluster = {} } = toJS(this.projectStore.magnumQuota) || {};
    const { left = 0 } = magnum_cluster;
    if (left === 0) {
      return this.getQuotaMessage(1, magnum_cluster, t('Clusters'));
    }
    return '';
  }

  getNodesInput() {
    const { data = {} } = this.state;
    const { node_count = 0, master_count = 0 } = data;
    const newNodes = node_count + master_count;
    return {
      newNodes,
    };
  }

  checkInstanceQuota() {
    const { quotaLoading } = this.state;
    if (quotaLoading) {
      return '';
    }
    const { newNodes } = this.getNodesInput();
    const { instances = {} } = this.projectStore.novaQuota || {};
    const { left = 0 } = instances;
    if (left !== -1 && left < newNodes) {
      return this.getQuotaMessage(newNodes, instances, t('Instance'));
    }
    return '';
  }

  get templateFlavor() {
    const { data = {} } = this.state;
    const { clusterTemplate: { selectedRows = [] } = {} } = data;
    const { master_flavor_id, flavor_id } = selectedRows[0] || {};
    const masterTemplateFlavor = this.flavors.find(
      (it) => it.id === master_flavor_id
    );
    const workTemplateFlavor = this.flavors.find((it) => it.id === flavor_id);
    return {
      masterTemplateFlavor,
      workTemplateFlavor,
    };
  }

  getFlavorInput() {
    const { data = {} } = this.state;
    const {
      flavor: { selectedRows = [] } = {},
      node_count = 1,
      masterFlavor: { selectedRows: selectedRowsMaster = [] } = {},
      master_count = 1,
    } = data;
    const { vcpus = 0, ram = 0 } =
      selectedRows[0] || this.templateFlavor.workTemplateFlavor || {};
    const ramGiB = getGiBValue(ram);
    const { vcpus: vcpusMaster = 0, ram: ramMaster = 0 } =
      selectedRowsMaster[0] || this.templateFlavor.masterTemplateFlavor || {};
    const ramGiBMaster = getGiBValue(ramMaster);
    const newCPU = vcpus * node_count + vcpusMaster * master_count;
    const newRam = ramGiB * node_count + ramGiBMaster * master_count;
    return {
      newCPU,
      newRam,
    };
  }

  checkFlavorQuota() {
    const { newCPU, newRam } = this.getFlavorInput();
    const { cores = {}, ram = {} } = this.projectStore.novaQuota || {};
    const { left = 0 } = cores || {};
    const { left: leftRam = 0 } = ram || {};
    if (left !== -1 && left < newCPU) {
      return this.getQuotaMessage(newCPU, cores, t('CPU'));
    }
    if (leftRam !== -1 && leftRam < newRam) {
      return this.getQuotaMessage(newRam, ram, t('Memory'));
    }
    return '';
  }

  checkVolumeQuota() {
    const { quotaLoading } = this.state;
    if (quotaLoading) {
      return '';
    }
    const { newNodes } = this.getNodesInput();
    const { volumes } = toJS(this.projectStore.cinderQuota) || {};
    const { left = 0 } = volumes;
    if (left !== -1 && left < newNodes) {
      return this.getQuotaMessage(newNodes, volumes, t('Volume'));
    }
    return '';
  }

  checkQuotaInput() {
    const clusterMsg = this.checkClusterQuota();
    const instanceMsg = this.checkInstanceQuota();
    const flavorMsg = this.checkFlavorQuota();
    const volumeMsg = this.checkVolumeQuota();
    const error = clusterMsg || instanceMsg || flavorMsg || volumeMsg;
    if (!error) {
      this.status = 'success';
      this.errorMsg = '';
      return '';
    }
    this.status = 'error';
    if (this.errorMsg !== error) {
      $message.error(error);
    }
    this.errorMsg = error;
    return error;
  }

  getQuotaMessage(value, quota, name) {
    const { left = 0 } = quota || {};
    if (left === -1) {
      return '';
    }
    if (value > left) {
      return t(
        'Insufficient {name} quota to create resources (left { quota }, input { input }).',
        { name, quota: left, input: value }
      );
    }
    return '';
  }

  onSubmit = (values) => {
    const {
      additionalLabels,
      clusterTemplate,
      keypair,
      auto_healing_enabled,
      auto_scaling_enabled,
      newNetwork,
      fixedNetwork,
      fixedSubnet,
      flavor,
      masterFlavor,
      ...rest
    } = values;
    const requestLabels = {};

    if (additionalLabels) {
      additionalLabels.forEach((item) => {
        const labelKey = item.value.key;
        const labelValue = item.value.value;
        requestLabels[labelKey] = labelValue;
      });
    }

    const data = {
      ...rest,
      name: values.name,
      labels: {
        ...requestLabels,
        auto_healing_enabled: `${!!auto_healing_enabled}`,
        auto_scaling_enabled: `${!!auto_scaling_enabled}`,
      },
      cluster_template_id: clusterTemplate.selectedRowKeys[0],
      keypair: (keypair && keypair.selectedRowKeys[0]) || null,
      master_flavor_id:
        (masterFlavor && masterFlavor.selectedRowKeys[0]) || null,
      flavor_id: (flavor && flavor.selectedRowKeys[0]) || null,
      fixed_network: (!newNetwork && fixedNetwork.selectedRowKeys[0]) || null,
      fixed_subnet: (!newNetwork && fixedSubnet.selectedRowKeys[0]) || null,
    };

    return this.store.create(data);
  };
}

export default inject('rootStore')(observer(StepCreate));
