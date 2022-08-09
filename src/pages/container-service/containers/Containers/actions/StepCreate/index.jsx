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
import { message as $message } from 'antd';
import { StepAction } from 'src/containers/Action';
import globalContainersStore from 'stores/zun/containers';
import globalProjectStore from 'stores/keystone/project';
import StepInfo from './StepInfo';
import StepSpec from './StepSpec';
import StepVolumes from './StepVolumes';
import StepNetworks from './StepNetworks';
import StepMiscellaneous from './StepMiscellaneous';

export class StepCreate extends StepAction {
  init() {
    this.store = globalContainersStore;
    this.projectStore = globalProjectStore;
    this.getQuota();
    this.state.isLoading = true;
    this.errorMsg = '';
  }

  static id = 'create-container';

  static title = t('Create Container');

  static path = '/container/containers/create';

  static policy = 'container:create';

  static aliasPolicy = 'zun:container:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Container');
  }

  get listUrl() {
    return this.getRoutePath('zunContainers');
  }

  get hasConfirmStep() {
    return false;
  }

  get steps() {
    return [
      {
        title: t('Info'),
        component: StepInfo,
      },
      {
        title: t('Spec'),
        component: StepSpec,
      },
      {
        title: t('Volumes'),
        component: StepVolumes,
      },
      {
        title: t('Network Config'),
        component: StepNetworks,
      },
      {
        title: t('Miscellaneous'),
        component: StepMiscellaneous,
      },
    ];
  }

  get showQuota() {
    return true;
  }

  get quotaInfo() {
    if (this.state.isLoading) {
      return [];
    }
    const {
      containers = {},
      cpu = {},
      memory = {},
      disk = {},
    } = this.projectStore.zunQuota;
    const { left = 0 } = containers || {};
    const {
      data: {
        cpu: cpuCount = 0,
        memory: memoryCount = 0,
        disk: diskCount = 0,
      } = {},
    } = this.state;
    const containersQuotaInfo = {
      ...containers,
      add: left ? 1 : 0,
      name: 'containers',
      title: t('Containers'),
    };

    const { left: cpuLeft = 0 } = cpu;
    const { left: memoryLeft = 0 } = memory;
    const { left: diskLeft = 0 } = disk;
    const canAdd =
      left &&
      (cpuLeft === -1 || cpuCount <= cpuLeft) &&
      (memoryLeft === -1 || memoryCount <= memoryLeft) &&
      (diskLeft === -1 || diskCount <= diskLeft);

    const cpuQuotaInfo = {
      ...cpu,
      add: canAdd ? cpuCount : 0,
      name: 'cpu',
      title: t('CPU'),
      type: 'line',
    };

    const memoryQuotaInfo = {
      ...memory,
      add: canAdd ? memoryCount : 0,
      name: 'memory',
      title: t('Memory (MiB)'),
      type: 'line',
    };

    const diskQuotaInfo = {
      ...disk,
      add: canAdd ? diskCount : 0,
      name: 'disk',
      title: t('Disk (GiB)'),
      type: 'line',
    };

    this.checkQuota(this.state.data, this.projectStore.zunQuota);

    return [containersQuotaInfo, cpuQuotaInfo, memoryQuotaInfo, diskQuotaInfo];
  }

  async getQuota() {
    await this.projectStore.fetchProjectZunQuota();
    this.setState({
      isLoading: false,
    });
  }

  getQuotaMessage(input, left, name) {
    if (left === -1) {
      return '';
    }
    if (left === 0) {
      return t('Quota: Insufficient { name } quota to create resources.', {
        name,
      });
    }
    if (input > left) {
      return t(
        'Insufficient {name} quota to create resources(left { quota }, input { input }).',
        { name, quota: left, input }
      );
    }
    return '';
  }

  checkQuota(data, quota) {
    const { containers = {}, cpu = {}, memory = {}, disk = {} } = quota || {};
    const {
      cpu: cpuCount = 0,
      memory: memoryCount = 0,
      disk: diskCount = 0,
    } = data || {};

    const { left: containerLeft = 0 } = containers;
    const containerMsg = this.getQuotaMessage(
      1,
      containerLeft,
      t('Containers')
    );

    const { left: cpuLeft = 0 } = cpu;
    const cpuMsg = this.getQuotaMessage(cpuCount, cpuLeft, t('CPU'));

    const { left: memoryLeft = 0 } = memory;
    const memoryMsg = this.getQuotaMessage(
      memoryCount,
      memoryLeft,
      t('Memory')
    );

    const { left: diskLeft = 0 } = disk;
    const diskMsg = this.getQuotaMessage(diskCount, diskLeft, t('Disk'));

    if (!containerMsg && !cpuMsg && !memoryMsg && !diskMsg) {
      this.errorMsg = '';
    } else {
      const msg = containerMsg || cpuMsg || memoryMsg || diskMsg;
      if (this.errorMsg !== msg) {
        $message.error(msg);
      }
      this.errorMsg = msg;
    }
  }

  get disableNext() {
    return !!this.errorMsg;
  }

  get disableSubmit() {
    return !!this.errorMsg;
  }

  onSubmit = (values) => {
    const {
      environmentVariables,
      labels,
      mounts,
      images,
      exitPolicy,
      maxRetry,
      networks,
      ports,
      hints,
      securityGroup,
      ...rest
    } = values;

    const requestEnvironment = {};
    const requestLabels = {};
    const requestVolumes = [];
    const requestHints = {};
    const nets = [];
    const securityGroups = [];

    if (environmentVariables) {
      environmentVariables.forEach((item) => {
        const labelKey = item.value.key.toLowerCase().trim();
        const labelValue = item.value.value.toLowerCase().trim();
        requestEnvironment[labelKey] = labelValue;
      });
    }

    if (labels) {
      labels.forEach((item) => {
        const key = item.value.key.toLowerCase().trim();
        const value = item.value.value.toLowerCase().trim();
        requestLabels[key] = value;
      });
    }

    if (mounts) {
      mounts.forEach((item) => {
        const { type, source, size, destination, isNewVolume } = item.value;
        if (isNewVolume) {
          requestVolumes.push({
            type,
            size,
            destination,
          });
        } else {
          requestVolumes.push({
            type,
            source,
            destination,
          });
        }
      });
    }

    if (networks) {
      (networks.selectedRowKeys || []).forEach((it) => {
        nets.push({ network: it });
      });
    }

    if (ports) {
      (ports.selectedRowKeys || []).forEach((it) => {
        nets.push({ port: it });
      });
    }

    if (securityGroup) {
      (securityGroup.selectedRows || []).forEach((it) => {
        securityGroups.push(it.name);
      });
    }

    if (hints) {
      hints.forEach((item) => {
        const key = item.value.key.toLowerCase().trim();
        const value = item.value.value.toLowerCase().trim();
        requestHints[key] = value;
      });
    }

    const body = {
      environment: requestEnvironment,
      labels: requestLabels,
      mounts: requestVolumes,
      hints: requestHints,
      nets,
      security_groups: securityGroups,
      ...rest,
    };

    if (images) {
      body.image = (images.selectedRows[0] || {}).name;
    }

    if (exitPolicy) {
      body.restart_policy = {
        Name: exitPolicy,
        ...(maxRetry ? { MaximumRetryCount: maxRetry } : {}),
      };
    }

    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(StepCreate));
