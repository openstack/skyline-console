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
import { isEmpty } from 'lodash';
import StepInfo from './StepInfo';
import StepSpec from './StepSpec';
import StepVolumes from './StepVolumes';
import StepNetworks from './StepNetworks';
import StepOthers from './StepOthers';

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

  static path = '/container-service/containers/create';

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
        title: t('Others'),
        component: StepOthers,
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
      title: t('Containers CPU'),
      type: 'line',
    };

    const memoryQuotaInfo = {
      ...memory,
      add: canAdd ? memoryCount : 0,
      name: 'memory',
      title: t('Containers Memory (MiB)'),
      type: 'line',
    };

    const diskQuotaInfo = {
      ...disk,
      add: canAdd ? diskCount : 0,
      name: 'disk',
      title: t('Containers Disk (GiB)'),
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
        'Insufficient {name} quota to create resources (left { quota }, input { input }).',
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
      exposedPorts,
      environmentVariables,
      labels,
      mounts,
      image_driver,
      imageDocker,
      imageGlance,
      exitPolicy,
      maxRetry,
      networks,
      ports,
      hints,
      securityGroup,
      healthcheck,
      healthcheck_cmd,
      healthcheck_interval,
      healthcheck_retries,
      healthcheck_timeout,
      command,
      entrypoint,
      ...rest
    } = values;

    const body = {
      image_driver,
      ...rest,
    };

    const requestExposedPorts = {};
    const nets = [];

    if (exposedPorts && exposedPorts.length) {
      exposedPorts.forEach((item) => {
        const key = `${item.value.port}/${item.value.protocol}`;
        requestExposedPorts[key] = {};
      });
      body.exposed_ports = requestExposedPorts;
    }

    if (environmentVariables && environmentVariables.length) {
      const requestEnvironment = environmentVariables.reduce(
        (result, current) => {
          const labelKey = current.value.key;
          const labelValue = current.value.value;
          result[labelKey] = labelValue;
          return result;
        },
        {}
      );
      body.environment = requestEnvironment;
    }

    if (labels && labels.length) {
      const requestLabels = labels.reduce((result, current) => {
        const { key } = current.value;
        const { value } = current.value;
        result[key] = value;
        return result;
      }, {});
      body.labels = requestLabels;
    }

    if (mounts && mounts.length) {
      const requestVolumes = mounts.reduce((result, current) => {
        const { type, source, size, destination, isNewVolume } = current.value;
        if (isNewVolume) {
          result.push({
            type,
            size,
            destination,
          });
        } else {
          result.push({
            type,
            source,
            destination,
          });
        }
        return result;
      }, []);
      body.mounts = requestVolumes;
    }

    if (networks && networks.selectedRowKeys.length) {
      networks.selectedRowKeys.forEach((it) => {
        nets.push({ network: it });
      });
      body.nets = nets;
    }

    if (ports && ports.selectedRowKeys.length) {
      ports.selectedRowKeys.forEach((it) => {
        nets.push({ port: it });
      });
      body.nets = nets;
    }

    if (hints && hints.length) {
      const requestHints = hints.reduce((result, current) => {
        const { key } = current.value;
        const { value } = current.value;
        result[key] = value;
        return result;
      }, {});
      body.hints = requestHints;
    }

    if (
      securityGroup &&
      securityGroup.selectedRows.length &&
      isEmpty(requestExposedPorts)
    ) {
      const securityGroups = securityGroup.selectedRows.reduce(
        (result, current) => {
          result.push(current.name);
          return result;
        },
        []
      );
      body.security_groups = securityGroups;
    }

    if (healthcheck) {
      body.healthcheck = {
        cmd: healthcheck_cmd,
        interval: healthcheck_interval,
        retries: healthcheck_retries,
        timeout: healthcheck_timeout,
      };
    }

    if (command) {
      body.command = [command];
    }

    if (entrypoint) {
      body.entrypoint = [entrypoint];
    }

    if (imageDocker && image_driver === 'docker') {
      body.image = imageDocker;
    }

    if (imageGlance && image_driver === 'glance') {
      body.image = imageGlance.selectedRowKeys[0];
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
