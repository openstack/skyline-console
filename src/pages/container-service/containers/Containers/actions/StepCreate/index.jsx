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
