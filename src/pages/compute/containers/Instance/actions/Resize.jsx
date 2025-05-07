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
import globalFlavorStore from 'stores/nova/flavor';
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import {
  isNotLockedOrAdmin,
  checkStatus,
  isIronicInstance,
} from 'resources/nova/instance';
import globalProjectStore from 'stores/keystone/project';
import { isEmpty } from 'lodash';
import { getGiBValue, formatSize, firstUpperCase } from 'utils/index';
import FlavorSelectTable from '../components/FlavorSelectTable';

export async function fetchQuota(self) {
  self.setState({
    quota: {},
    quotaLoading: true,
  });
  const result = await globalProjectStore.fetchProjectNovaQuota();
  self.setState({
    quota: result,
    quotaLoading: false,
  });
}

export const getQuota = (novaQuota) => {
  if (isEmpty(novaQuota)) {
    return {};
  }
  const { cores = {}, ram = {} } = novaQuota || {};
  return {
    cores,
    ram,
  };
};

export const getAdd = (self, flavor) => {
  if (isEmpty(flavor)) {
    return {};
  }
  const { vcpus: itemVcpus, ram: itemRam } = self.item.flavor_info || {};
  const { vcpus, ram: flavorRam } = flavor || {};
  const newVcpu = vcpus - itemVcpus;
  const newRamGiB = getGiBValue(flavorRam - itemRam);
  return {
    vcpuAdd: newVcpu,
    ramAdd: newRamGiB,
  };
};

export const checkFlavorDisable = (flavor, self) => {
  const { quotaLoading = true, quota } = self.state;
  if (quotaLoading || isEmpty(quota)) {
    return false;
  }
  const {
    cores: { left },
    ram: { left: ramLeft },
  } = getQuota(quota);
  const { vcpuAdd, ramAdd } = getAdd(self, flavor);
  const vcpuOK = left === -1 || left >= vcpuAdd;
  const ramOK = ramLeft === -1 || ramLeft >= ramAdd;
  return !vcpuOK || !ramOK;
};

export const getQuotaInfo = (self) => {
  const { quota = {}, quotaLoading, flavor = {} } = self.state;
  if (quotaLoading || isEmpty(quota)) {
    return [];
  }
  const { cores = {}, ram = {} } = getQuota(quota);
  const { vcpuAdd = 0, ramAdd = 0 } = getAdd(self, flavor || {});

  const cpuQuotaInfo = {
    ...cores,
    add: vcpuAdd,
    name: 'cpu',
    title: t('CPU'),
  };

  const ramQuotaInfo = {
    ...ram,
    add: ramAdd,
    name: 'ram',
    title: t('Memory (GiB)'),
    type: 'line',
  };
  return [cpuQuotaInfo, ramQuotaInfo];
};

export const getFlavorLabel = (self) => {
  const { flavor, flavor_info: { vcpus, ram } = {} } = self.item;
  return `${flavor} (${t('VCPUs')}: ${vcpus}, ${t('Memory')}: ${formatSize(
    ram,
    2
  )})`;
};

export class Resize extends ModalAction {
  static id = 'resize';

  static title = t('Resize');

  static isDanger = true;

  init() {
    this.store = globalFlavorStore;
    fetchQuota(this);
  }

  get name() {
    return t('resize');
  }

  static get modalSize() {
    return 'large';
  }

  get isAsyncAction() {
    return true;
  }

  get successText() {
    if (this.messageHasItemName) {
      if (this.isAsyncAction) {
        return firstUpperCase(
          t(
            'The {action} instruction has been issued, instance: {name}. \n To complete this instance resize, please go to More > Configuration Update > Confirm Resize or Migrate.',
            { action: this.name.toLowerCase(), name: this.instanceName }
          )
        );
      }
      return firstUpperCase(
        t('{action} successfully, instance: {name}.', {
          action: this.name.toLowerCase(),
          name: this.instanceName,
        })
      );
    }
    if (this.isAsyncAction) {
      return firstUpperCase(
        t(
          'The {action} instruction has been issued. \n To complete this instance resize, please go to More > Configuration Update > Confirm Resize or Migrate.',
          { action: this.name.toLowerCase() }
        )
      );
    }
    return firstUpperCase(t('{action} successfully.', { action: this.name }));
  }

  getModalSize() {
    return 'large';
  }

  get tips() {
    return (
      <div>
        <p style={{ color: globalCSS.primaryColor }}>
          {t('The current operation requires the instance to be shut down:')}
        </p>
        <p>
          {t(
            'In order to avoid data loss, the instance will shut down and interrupt your business. Please confirm carefully.'
          )}
        </p>
        <p>
          {t(
            'Forced shutdown may result in data loss or file system damage. You can also take the initiative to shut down and perform operations.'
          )}
        </p>
      </div>
    );
  }

  get showQuota() {
    return true;
  }

  get quotaInfo() {
    return getQuotaInfo(this);
  }

  get defaultValue() {
    const { name } = this.item;
    const flavor = getFlavorLabel(this);
    const value = {
      instance: name,
      flavor,
    };
    return value;
  }

  static policy = 'os_compute_api:servers:resize';

  static isActiveOrShutOff = (item) =>
    checkStatus(['active', 'shutoff'], item, false);

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(
      !this.isAdminPage &&
        this.isActiveOrShutOff(item) &&
        isNotLockedOrAdmin(item, isAdminPage) &&
        !isIronicInstance(item)
    );
  };

  onFlavorChange = (flavor) => {
    const { selectedRows = [] } = flavor || {};
    this.setState({
      flavor: selectedRows[0],
    });
  };

  disabledFlavor = (flavor) => {
    return checkFlavorDisable(flavor, this);
  };

  get formItems() {
    const { flavor } = this.item;
    return [
      {
        name: 'instance',
        label: t('Instance'),
        type: 'label',
        iconType: 'instance',
      },
      {
        name: 'flavor',
        label: t('Current Flavor'),
        type: 'label',
        iconType: 'flavor',
      },
      {
        name: 'newFlavor',
        label: t('Flavor'),
        type: 'select-table',
        component: (
          <FlavorSelectTable
            flavor={flavor}
            onChange={this.onFlavorChange}
            disabledFunc={this.disabledFlavor}
          />
        ),
        required: true,
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 18,
          },
        },
      },
      {
        name: 'option',
        label: t('Forced Shutdown'),
        type: 'check',
        content: t('Agree to force shutdown'),
        required: true,
        validator: (rule, value) => {
          if (value !== true) {
            return Promise.reject(
              new Error(t('Force shutdown must be checked!'))
            );
          }
          return Promise.resolve();
        },
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { newFlavor } = values;
    const flavor = newFlavor.selectedRowKeys[0];
    return globalServerStore.resize({ id, flavor });
  };
}

export default inject('rootStore')(observer(Resize));
