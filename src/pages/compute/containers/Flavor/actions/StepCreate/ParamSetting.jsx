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
import { toJS } from 'mobx';
import NUMAInput from 'components/FormItem/NUMAInput';
import Base from 'components/Form';
import {
  cpuPolicyList,
  cpuThreadPolicyList,
  flavorArchitectures,
  flavorCategoryList,
  categoryHasIOPS,
  categoryHasEphemeral,
  isGpuCategory,
  isComputeOptimized,
  pageTypeList,
  getAllArchitecture,
  getFamilyItemValue,
  isGpuVisual,
} from 'resources/nova/flavor';
import globalSettingStore from 'stores/skyline/setting';
import { getOptions } from 'utils/index';
import { parse } from 'qs';
import KeyValueInput from 'components/FormItem/KeyValueInput';
import { isEmpty } from 'lodash';

export class ParamSetting extends Base {
  init() {
    this.settingStore = globalSettingStore;
    this.getSettings();
  }

  async getSettings() {
    await this.settingStore.fetchList();
    this.updateDefaultValue();
  }

  get isStep() {
    return true;
  }

  get familyItemValue() {
    return getFamilyItemValue(this.settingStore.list.data);
  }

  get tab() {
    const params = parse(this.routing.location.search.slice(1));
    const { tab } = params;
    return tab;
  }

  get flavorArchitectures() {
    return getAllArchitecture(this.settingStore.list.data, false).map((it) => ({
      label: flavorArchitectures[it],
      value: it,
    }));
  }

  get flavorCategoryList() {
    const { architecture } = this.state;
    if (!architecture) {
      return [];
    }
    const familyItem = this.familyItemValue.find(
      (it) => it.architecture === architecture
    );
    if (!familyItem) {
      return [];
    }
    return familyItem.categories.map((it) => ({
      value: it.name,
      label: flavorCategoryList[it.name] || it.name,
      properties: it.properties,
    }));
  }

  get gpuTypes() {
    const item = (this.settingStore.list.data || []).find(
      (it) => it.key === 'gpu_models'
    );
    if (item && item.value instanceof Array) {
      return item.value.map((it) => ({
        value: it,
        label: it,
      }));
    }
    if (item && typeof item.value === 'object') {
      return Object.keys(item.value).map((it) => ({
        label: it,
        value: it,
      }));
    }
    return [];
  }

  get usbTypes() {
    const item = (this.settingStore.list.data || []).find(
      (it) => it.key === 'usb_models'
    );
    if (item && item.value instanceof Array) {
      return item.value.map((it) => ({
        value: it,
        label: it,
      }));
    }
    if (item && typeof item.value === 'object') {
      return Object.keys(item.value).map((it) => ({
        label: it,
        value: it,
      }));
    }
    return [];
  }

  get vgpuTypes() {
    return [{ value: 'vgpu', label: 'vgpu' }];
  }

  getCategoryProperties = (category) => {
    const item = this.flavorCategoryList.find((it) => it.value === category);
    return item ? item.properties : [];
  };

  get resourcePropNeedKeys() {
    return ['VCPU', 'MEMORY_MB', 'DISK_GB'];
  }

  getDefaultResourcePropValues = () => {
    return this.resourcePropNeedKeys.map((key, index) => ({
      index,
      value: {
        key,
        value: '0',
      },
    }));
  };

  get defaultValue() {
    const data = {
      vcpus: 1,
      memoryGb: 1,
      numaNodesNum: 1,
      settings: toJS(this.settingStore.list.data || []),
      ephemeral: 0,
      ephemeralTmp: 0,
      disk: 0,
      architecture: this.tab,
      attachUsb: false,
      resourceProps: this.getDefaultResourcePropValues(),
      traitProps: [],
      memPageSizeMore: 'any',
      memPageSize: 'large',
    };
    return data;
  }

  get defaultNUMAValue() {
    return {
      cpu: 1,
      ram: 1024,
    };
  }

  get nameForStateUpdate() {
    return [
      'architecture',
      'category',
      'attachUsb',
      'memPageSizeMore',
      'more',
      'memPageSize',
    ];
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  allowed = () => Promise.resolve();

  numaValidate = ({ getFieldValue }) => ({
    validator(rule, value) {
      const category = getFieldValue('category');
      const typeIsComputeOptimized = isComputeOptimized(category);
      if (!typeIsComputeOptimized) {
        return Promise.resolve();
      }
      if (!value || value.length === 0) {
        return Promise.reject(t('Please set MUNA'));
      }
      const vcpus = getFieldValue('vcpus');
      const memoryGb = getFieldValue('memoryGb');
      if (!vcpus || !memoryGb) {
        return Promise.reject(t('Please set CPU && Ram first.'));
      }
      const ram = memoryGb * 1024;
      let totalCpu = 0;
      let totalRam = 0;
      value.forEach((it) => {
        totalCpu += it.value.cpu;
        totalRam += it.value.ram;
      });
      let hasError = false;
      let error = t('Invalid: ');
      if (totalCpu !== vcpus) {
        error += t(
          'CPU value is { cpu }, NUMA CPU value is { totalCpu }, need to be equal. ',
          { cpu: vcpus, totalCpu }
        );
        hasError = true;
      }
      if (totalRam !== memoryGb * 1024) {
        error += t(
          'Ram value is { ram }, NUMA RAM value is { totalRam }, need to be equal. ',
          { ram, totalRam }
        );
        hasError = true;
      }
      if (hasError) {
        return Promise.reject(error);
      }
      return Promise.resolve();
    },
  });

  pageSizeValueValidate = (rule, value) => {
    const r =
      /^[1-9]\d*(Kb\(it\)|Kib\(it\)|Mb\(it\)|Mib\(it\)|Gb\(it\)|Gib\(it\)|Tb\(it\)|Tib\(it\)|KB|KiB|MB|MiB|GB|GiB|TB|TiB)?$/;
    if (r.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject(t('Please enter right format memory page value!'));
  };

  checkResourceProps = (values) => {
    const item = values.find((it, index) => {
      const { key, value } = it.value || {};
      if (!value) {
        return true;
      }
      if (index >= this.resourcePropNeedKeys.length) {
        const r = /^CUSTOM_[A-Z0-9_]{1,248}$/;
        if (!r.test(key)) {
          return true;
        }
      }
      return false;
    });
    return !item;
  };

  checkTraitProps = (values) => {
    if (isEmpty(values)) {
      return true;
    }
    const item = values.find((it) => !it.value);
    return !item;
  };

  get formItems() {
    const {
      architecture,
      category,
      attachUsb,
      memPageSizeMore,
      more = false,
      memPageSize,
    } = this.state;
    const isBareMetal = architecture === 'bare_metal';
    const hasIOPS = categoryHasIOPS(category);
    const hasEphemeral = categoryHasEphemeral(category);
    const isGPUType = isGpuCategory(category);
    const isGpuVisualType = isGpuVisual(category);
    const isGpuComputeType = isGPUType && !isGpuVisualType;
    const typeIsComputeOptimized = isComputeOptimized(category);
    const instanceType = flavorCategoryList[category] || category;
    const showNumaInput = !typeIsComputeOptimized && !isBareMetal;
    const showMemPageMore = more && showNumaInput;
    const showPageSizeInputMore =
      showMemPageMore && memPageSizeMore === 'custom';
    const showPageSizeInput =
      typeIsComputeOptimized && memPageSize === 'custom';

    const NUMATip = t(
      'It is recommended that { instanceType } instance simultaneously set NUMA affinity policy for PCIE device to force or priority matching. This configuration can further improve PCIE computing performance.',
      { instanceType }
    );
    const cpuBindTip = t(
      'It is recommended to set CPU binding strategy as binding on { instanceType } instance. This configuration further improves the performance of the instance CPU.',
      { instanceType }
    );
    const cpuThreadBindTip = t(
      'It is recommended to set the CPU thread binding policy as thread binding in { instanceType } instance, which can further improve the CPU performance of instance.',
      { instanceType }
    );
    const largePageTip = t(
      'It is recommended that the { instanceType } instance simultaneously set large page memory to large. { instanceType } instances also require faster memory addressing capabilities.',
      { instanceType }
    );
    const largePageValueTip = t(
      'The unit suffix must be one of the following: Kb(it), Kib(it), Mb(it), Mib(it), Gb(it), Gib(it), Tb(it), Tib(it), KB, KiB, MB, MiB, GB, GiB, TB, TiB. If the unit suffix is not provided, it is assumed to be KB.'
    );
    const pageSizePlaceholder = t(
      'Please enter a memory page size, such as: 1024, 1024MiB'
    );

    return [
      {
        name: 'title1',
        label: t('Basic Parameters'),
        type: 'title',
      },
      {
        name: 'architecture',
        label: t('Architecture'),
        type: 'radio',
        options: this.flavorArchitectures,
        required: true,
      },
      {
        name: 'category',
        label: t('Type'),
        type: 'radio',
        options: this.flavorCategoryList,
        required: true,
        wrapperCol: {
          xs: {
            span: 16,
          },
          sm: {
            span: 12,
          },
        },
      },
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        name: 'vcpus',
        label: t('CPU(Core)'),
        type: 'input-int',
        min: 1,
        extra: t(
          'The number of vCPU cores should not exceed the maximum number of CPU cores of the physical node. Otherwise it will cause fail to schedule to any physical node when creating instance.'
        ),
        required: true,
      },
      {
        name: 'memoryGb',
        label: t('Ram Size (GiB)'),
        type: 'input-int',
        min: 1,
        required: true,
      },
      {
        name: 'bandwidth',
        label: t('Internal Network Bandwidth (Gbps)'),
        type: 'input-int',
        hidden: isBareMetal,
        min: 1,
      },
      {
        name: 'ephemeral',
        label: t('Ephemeral Disk (GiB)'),
        type: 'input-int',
        min: 0,
        hidden: !hasEphemeral,
        required: hasEphemeral,
      },
      {
        name: 'ephemeralTmp',
        label: t('Ephemeral Disk (GiB)'),
        type: 'input-int',
        min: 0,
        hidden: isBareMetal || hasEphemeral,
        disabled: !hasEphemeral,
      },
      {
        name: 'disk',
        label: t('Root Disk (GiB)'),
        type: 'input-int',
        min: 0,
        hidden: this.enableCinder,
      },
      {
        name: 'iops',
        label: t('Storage IOPS'),
        type: 'input-int',
        min: 1,
        hidden: isBareMetal || !hasIOPS,
      },
      {
        name: 'numaNodesNum',
        label: t('NUMA Nodes'),
        type: 'input-int',
        min: 1,
        required: true,
        hidden: !showNumaInput,
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
        hidden: !showNumaInput,
      },
      {
        name: 'memPageSizeMore',
        label: t('Memory Page'),
        type: 'select',
        options: pageTypeList,
        hidden: !showMemPageMore,
        required: showMemPageMore,
        tip: largePageTip,
      },
      {
        name: 'memPageSizeValueMore',
        label: t('Memory Page Size'),
        type: 'input',
        hidden: !showPageSizeInputMore,
        required: showPageSizeInputMore,
        extra: largePageValueTip,
        validator: this.pageSizeValueValidate,
        placeholder: pageSizePlaceholder,
      },
      {
        name: 'gpu-type',
        label: t('GPU Parameters'),
        type: 'title',
        hidden: !isGPUType,
      },
      {
        name: 'gpuType',
        label: t('GPU Model'),
        type: 'select',
        hidden: !isGpuComputeType,
        required: isGpuComputeType,
        options: this.gpuTypes,
        tip: t(
          'GPU pass-through will load GPU devices directly to the instance for use. VGPU is a GPU virtualization solution. GPU resources will be segmented and distributed to multiple instances for shared use.'
        ),
      },
      {
        name: 'gpuNumber',
        label: t('Number of GPU'),
        type: 'input-int',
        min: 1,
        hidden: !isGPUType,
        required: isGPUType,
      },
      {
        name: 'title2',
        label: t('Optimized Parameters'),
        type: 'title',
        hidden: !typeIsComputeOptimized,
      },
      {
        name: 'numaNodes',
        label: t('NUMA Nodes'),
        type: 'add-select',
        dependencies: ['vcpu', 'memoryGb'],
        required: typeIsComputeOptimized,
        defaultItemValue: this.defaultNUMAValue,
        itemComponent: NUMAInput,
        minCount: 1,
        maxCount: 8,
        addTextTips: t('NUMA Node'),
        addText: t('Add NUMA Node'),
        otherRule: this.numaValidate,
        // validator: this.numaValidate,
        hidden: !typeIsComputeOptimized,
        tip: NUMATip,
      },
      {
        name: 'cpuPolicy',
        label: t('CPU Policy'),
        type: 'radio',
        options: getOptions(cpuPolicyList),
        tip: cpuBindTip,
        hidden: !typeIsComputeOptimized,
        required: typeIsComputeOptimized,
      },
      {
        name: 'cpuThreadPolicy',
        label: t('CPU Thread Policy'),
        type: 'select',
        options: cpuThreadPolicyList,
        tip: cpuThreadBindTip,
        hidden: !typeIsComputeOptimized,
        required: typeIsComputeOptimized,
      },
      {
        name: 'memPageSize',
        label: t('Memory Page'),
        type: 'select',
        options: pageTypeList,
        hidden: !typeIsComputeOptimized,
        required: typeIsComputeOptimized,
        tip: largePageTip,
      },
      {
        name: 'memPageSizeValue',
        label: t('Memory Page Size'),
        type: 'input',
        hidden: !showPageSizeInput,
        required: showPageSizeInput,
        extra: largePageValueTip,
        validator: this.pageSizeValueValidate,
        placeholder: pageSizePlaceholder,
      },
      {
        name: 'usb-type',
        label: t('USB Parameters'),
        type: 'title',
        hidden: !this.usbTypes[0],
      },
      {
        name: 'attachUsb',
        label: t('Attach USB'),
        type: 'radio',
        optionType: 'default',
        hidden: !this.usbTypes[0],
        options: [
          {
            label: t('Yes'),
            value: true,
          },
          {
            label: t('No'),
            value: false,
          },
        ],
      },
      {
        name: 'usbType',
        label: t('Usb Controller'),
        type: 'select',
        hidden: !attachUsb,
        required: attachUsb,
        options: this.usbTypes,
      },
      {
        name: 'usbNumber',
        label: t('Number of Usb Controller'),
        type: 'input-int',
        min: 1,
        hidden: !attachUsb,
        required: attachUsb,
      },
      {
        name: 'bare-metal-type',
        label: t('BareMetal Parameters'),
        type: 'title',
        hidden: !isBareMetal,
      },
      {
        name: 'resourceProps',
        label: t('Resource Class Properties'),
        type: 'add-select',
        itemComponent: KeyValueInput,
        addText: t('Add Property'),
        minCount: this.resourcePropNeedKeys.length,
        hidden: !isBareMetal,
        required: isBareMetal,
        readonlyKeys: this.resourcePropNeedKeys,
        extra: (
          <div>
            <p>
              {t(
                '1. The name of the custom resource class property should start with CUSTOM_, can only contain uppercase letters A ~ Z, numbers 0 ~ 9 or underscores, and the length should not exceed 255 characters (for example: CUSTOM_BAREMETAL_SMALL).'
              )}
            </p>
            <p>
              {t(
                '2. You can customize the resource class name of the flavor, but it needs to correspond to the resource class of the scheduled node (for example, the resource class name of the scheduling node is baremetal.with-GPU, and the custom resource class name of the flavor is CUSTOM_BAREMETAL_WITH_GPU=1).'
              )}
            </p>
          </div>
        ),
        validator: (rule, value) => {
          if (!this.checkResourceProps(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(t('Please enter right format key value!'));
          }
          return Promise.resolve();
        },
      },
      {
        name: 'traitProps',
        label: t('Trait Properties'),
        type: 'add-select',
        isInput: true,
        addText: t('Add Property'),
        hidden: !isBareMetal,
        required: isBareMetal,
        extra: t(
          'The trait name of the flavor needs to correspond to the trait of the scheduling node; by injecting the necessary traits into the ironic instance, the computing service will only schedule the instance to the bare metal node with all necessary traits (for example: the trait of the scheduling node has HW_CPU_X86_VMX trait, and the flavor adds HW_CPU_X86_VMX, it can be scheduled to this node for necessary traits).'
        ),
        validator: (rule, value) => {
          if (!this.checkTraitProps(value)) {
            // eslint-disable-next-line prefer-promise-reject-errors
            return Promise.reject(t('Please enter right format trait!'));
          }
          return Promise.resolve();
        },
      },
    ];
  }
}

export default inject('rootStore')(observer(ParamSetting));
