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
import { StepAction } from 'containers/Action';
import globalFlavorStore from 'stores/nova/flavor';
import {
  categoryHasIOPS,
  categoryHasEphemeral,
  isGpuCategory,
  isComputeOptimized,
  isGpuVisual,
  isBareMetal,
} from 'resources/nova/flavor';
import { parse } from 'qs';
import AccessTypeSetting from './AccessTypeSetting';
import ParamSetting from './ParamSetting';

export class StepCreate extends StepAction {
  static id = 'flavor-create';

  static title = t('Create Flavor');

  static path = '/compute/flavor-admin/create';

  static policy = 'os_compute_api:os-flavor-manage:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get tab() {
    const params = parse(this.routing.location.search.slice(1));
    const { tab } = params;
    return tab;
  }

  get listUrl() {
    // const { architecture } = this.values || {};
    // const tab = architecture || this.tab;

    // Set tab to fixed `null` to avoid showing the tab query param on Flavors List page.
    const tab = null;

    return this.getRoutePath('flavor', null, { tab });
  }

  get name() {
    return t('create flavor');
  }

  get hasConfirmStep() {
    return false;
  }

  init() {
    this.store = globalFlavorStore;
  }

  get steps() {
    return [
      {
        title: t('Params Setting'),
        component: ParamSetting,
      },
      {
        title: t('Access Type Setting'),
        component: AccessTypeSetting,
      },
    ];
  }

  getProperties = (architecture, category, settings) => {
    const settingItem = settings.find((it) => it.key === 'flavor_families');
    const archItem = settingItem.value.find(
      (it) => it.architecture === architecture
    );
    const categoryItem = archItem.categories.find((it) => it.name === category);
    const obj = {};
    (categoryItem.properties || []).forEach((it) => {
      obj[it.key] = it.value;
    });
    return obj;
  };

  getPageSizeValue(type, value) {
    return type === 'custom' ? value : type;
  }

  getSubmitData(values) {
    const {
      architecture,
      category,
      name,
      vcpus,
      memoryGb,
      bandwidth,
      iops,
      ephemeral,
      gpuType,
      gpuNumber,
      numaNodesNum,
      memPageSizeValueMore,
      memPageSizeValue,
      memPageSizeMore,
      attachUsb,
      usbType,
      usbNumber,
      numaNodes,
      cpuPolicy,
      cpuThreadPolicy,
      memPageSize,
      settings = [],
      accessType,
      accessControl = {},
      resourceProps,
      traitProps,
      disk,
    } = values;
    const body = {
      name,
      vcpus,
      ram: memoryGb * 1024,
      disk: disk || 0,
    };
    const isPublic = accessType === 'public';
    body['os-flavor-access:is_public'] = isPublic;
    if (categoryHasEphemeral(category)) {
      body['OS-FLV-EXT-DATA:ephemeral'] = ephemeral;
    }
    const properties = this.getProperties(architecture, category, settings);
    const extraSpecs = {
      ':architecture': architecture,
      ':category': category,
      ...properties,
    };
    if (bandwidth) {
      extraSpecs['quota:vif_outbound_average'] = bandwidth * 1000 * 125;
      extraSpecs['quota:vif_inbound_average'] = bandwidth * 1000 * 125;
    }
    if (categoryHasIOPS(category) && iops) {
      extraSpecs['quota:disk_total_iops_sec'] = iops;
    }
    const isGPUType = isGpuCategory(category);
    const isGpuVisualType = isGpuVisual(category);
    const isGpuComputeType = isGPUType && !isGpuVisualType;
    if (attachUsb) {
      extraSpecs['pci_passthrough:alias'] = `${usbType}:${usbNumber}`;
    }
    if (isGpuComputeType) {
      extraSpecs['pci_passthrough:alias'] = attachUsb
        ? `${gpuType}:${gpuNumber},${usbType}:${usbNumber}`
        : `${gpuType}:${gpuNumber}`;
    } else if (isGpuVisualType) {
      extraSpecs['resources:VGPU'] = `${gpuType}:${gpuNumber}`;
    }
    if (isComputeOptimized(category)) {
      extraSpecs['hw:numa_nodes'] = numaNodes.length;
      numaNodes.forEach((item, index) => {
        extraSpecs[`hw:numa_cpus.${index}`] = item.value.cpu;
        extraSpecs[`hw:numa_mem.${index}`] = item.value.ram;
      });
      extraSpecs['hw:cpu_policy'] = cpuPolicy;
      extraSpecs['hw:cpu_thread_policy'] = cpuThreadPolicy;
      extraSpecs['hw:mem_page_size'] = this.getPageSizeValue(
        memPageSize,
        memPageSizeValue
      );
    } else if (architecture !== 'bare_metal') {
      extraSpecs['hw:numa_nodes'] = numaNodesNum;
      extraSpecs['hw:mem_page_size'] = this.getPageSizeValue(
        memPageSizeMore,
        memPageSizeValueMore
      );
    }
    if (isBareMetal(architecture)) {
      resourceProps.forEach((it) => {
        const { key, value } = it.value;
        extraSpecs[`resources:${key}`] = value;
      });
      traitProps.forEach((it) => {
        const { value } = it;
        extraSpecs[`trait:${value}`] = 'required';
      });
    }
    return {
      body,
      extraSpecs,
      accessControl: !isPublic && (accessControl.selectedRowKeys || []),
    };
  }

  onSubmit = (data) => {
    const { body, extraSpecs, accessControl } = data;
    return this.store.create(body, extraSpecs, accessControl);
  };
}

export default inject('rootStore')(observer(StepCreate));
