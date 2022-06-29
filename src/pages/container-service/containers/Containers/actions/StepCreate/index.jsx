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
import globalContainersStore from 'src/stores/zun/containers';
import StepInfo from './StepInfo';
import StepSpec from './StepSpec';
import StepVolumes from './StepVolumes';
import StepNetworks from './StepNetworks';
import StepMiscellaneous from './StepMiscellaneous';

export class StepCreate extends StepAction {
  init() {
    this.store = globalContainersStore;
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

  onSubmit = (values) => {
    const { environmentVariables, labels, mounts } = values;

    const requestEnviranment = {};
    const requestLabels = {};
    const requestValumes = [];

    environmentVariables !== undefined
      ? environmentVariables.forEach((item) => {
          const labelKey = item.value.key.toLowerCase().trim();
          const labelValue = item.value.value.toLowerCase().trim();
          requestEnviranment[labelKey] = labelValue;
        })
      : undefined;

    labels !== undefined
      ? labels.forEach((item) => {
          const key = item.value.key.toLowerCase().trim();
          const value = item.value.value.toLowerCase().trim();
          requestLabels[key] = value;
        })
      : undefined;

    mounts !== undefined
      ? mounts.forEach((item) => {
          const { destination } = item.value;
          const { source } = item.value;
          const { type } = item.value;
          const { cinderVolumeSize } = item.value;
          item.value.isCinderVolume !== true
            ? requestValumes.push({
                destination,
                source,
                type,
              })
            : requestValumes.push({
                destination,
                cinderVolumeSize,
                type,
              });
        })
      : undefined;

    const networks = [];
    const securityGroups = [];

    values.networkSelect &&
      values.networkSelect.selectedRowKeys.forEach((item) => {
        networks.push({ network: item });
      });

    values.ports &&
      values.ports.selectedRowKeys.forEach((item) => {
        networks.push({ port: item });
      });

    values.securityGroup &&
      values.securityGroup.selectedRowKeys.forEach((item) => {
        securityGroups.push(item);
      });

    return this.store.create({
      name: values.containerName,
      image: values.image,
      command: values.command,
      cpu: values.cpu,
      memory: values.memory,
      workdir: values.workingDirectory,
      labels: requestLabels,
      environment: requestEnviranment,
      restart_policy: {
        Name: values.exitPolicy === undefined ? 'no' : values.exitPolicy,
        MaximumRetryCount: values.maxRetry === undefined ? 0 : values.maxRetry,
      },
      interactive: values.enableInteractiveMode,
      image_driver: values.imageDriver,
      security_groups: securityGroups,
      nets: networks,
      runtime: values.runtime,
      hostname: values.hostname,
      auto_heal: values.enableAutoHeal,
      availability_zone: values.availableZone,
      hints: values.hints,
      mounts: values.mounts,
    });
  };
}

export default inject('rootStore')(observer(StepCreate));
