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

import { createElement } from 'react';
import { formatSize, getOptions } from 'utils';
import styles from './flavor.less';

export const cpuPolicyList = {
  dedicated: t('Dedicated'),
  shared: t('Shared'),
};

export const cpuThreadPolicyList = [
  {
    label: t('Prefer(Thread siblings are preferred)'),
    value: 'prefer',
  },
  {
    label: t('Isolate(No multithreading)'),
    value: 'isolate',
  },
  {
    label: t('Require(Need multithreading)'),
    value: 'require',
  },
];

export const cpuThreadPolicyMap = {
  prefer: t('Prefer'),
  isolate: t('Isolate'),
  require: t('Require'),
};

export const pageTypeList = [
  {
    label: t('Large(Optimal performance)'),
    value: 'large',
  },
  {
    label: t('Small(Not recommended)'),
    value: 'small',
  },
  {
    label: t('Any(Random)'),
    value: 'any',
  },
  {
    label: t('Custom'),
    value: 'custom',
  },
];

export const pageTypeMap = {
  large: t('Large'),
  small: t('Small'),
  any: t('Any'),
};

export const flavorArchitectures = {
  x86_architecture: t('X86 Architecture'),
  heterogeneous_computing: t('Heterogeneous Computing'),
  bare_metal: t('Bare Metal'),
  arm_architecture: t('ARM Architecture'),
  custom: t('Custom'),
  all: t('All Flavors'),
};

export const x86CategoryList = {
  general_purpose: t('General Purpose'),
  compute_optimized: t('Compute Optimized'),
  memory_optimized: t('Memory Optimized'),
  big_data: t('Big Data'),
  local_ssd: t('Local SSD'),
  high_clock_speed: t('High Clock Speed'),
};

export const ironicCategoryList = {
  general_purpose: t('General Purpose'),
};

export const armCategoryList = x86CategoryList;

export const heterogeneousCategoryList = {
  compute_optimized_type_with_gpu: t('Compute Optimized Type with GPU'),
  visualization_compute_optimized_type_with_gpu: t(
    'Visualization Compute Optimized Type with GPU'
  ),
  compute_optimized_type: t('Compute Optimized Type'),
};

export const bareMetalCategoryList = {
  general_purpose: t('General Purpose'),
};

export const flavorCategoryList = {
  ...x86CategoryList,
  ...heterogeneousCategoryList,
};

export const hasIOPSTypes = [
  'general_purpose',
  'compute_optimized',
  'memory_optimized',
  'high_clock_speed',
  'compute_optimized_type_with_gpu',
  'visualization_compute_optimized_type_with_gpu',
  'compute_optimized_type',
];

export const hasEphemeralTypes = [
  'big_data',
  'local_ssd',
  'compute_optimized_type_with_gpu',
];

export const categoryHasIOPS = (category) =>
  category && hasIOPSTypes.indexOf(category) >= 0;

export const categoryHasEphemeral = (category) =>
  category && hasEphemeralTypes.indexOf(category) >= 0;

export const isGpuCategory = (category) =>
  category && category.indexOf('_gpu') >= 0;

export const isGpuVisual = (category) =>
  category === 'visualization_compute_optimized_type_with_gpu';

export const isComputeOptimized = (category) =>
  category === 'compute_optimized_type';

export const getBaseColumns = (self) => [
  {
    title: t('ID/Name'),
    dataIndex: 'name',
    routeName: self ? self.getRouteName('flavorDetail') : '',
  },
  {
    title: t('Category'),
    dataIndex: 'category',
    valueMap: flavorCategoryList,
  },
  {
    title: t('CPU'),
    dataIndex: 'vcpus',
    isHideable: true,
  },
  {
    title: t('Memory'),
    dataIndex: 'ram',
    isHideable: true,
    render: (ram) => formatSize(ram, 2),
  },
  {
    title: t('Internal Network Bandwidth (Gbps)'),
    dataIndex: 'quota:vif_outbound_average',
    isHideable: true,
    width: 120,
    render: (value) => {
      if (!value) {
        return '-';
      }
      return value / 1000 / 125;
    },
  },
  {
    title: t('Ephemeral Disk (GiB)'),
    dataIndex: 'OS-FLV-EXT-DATA:ephemeral',
    isHideable: true,
  },
  {
    title: t('Storage IOPS'),
    dataIndex: 'quota:disk_total_iops_sec',
    isHideable: true,
    render: (value) => {
      if (!value) {
        return '-';
      }
      return value;
    },
  },
];

export const extraColumns = [
  {
    title: t('Public'),
    dataIndex: 'is_public',
    isHideable: true,
    valueRender: 'yesNo',
  },
  {
    title: t('Metadata'),
    dataIndex: 'extra_specs',
    isHideable: true,
    render: (value) => {
      return createElement(
        'div',
        {
          className: styles.metadata,
        },
        JSON.stringify(value ?? {})
      );
    },
  },
];

export const cpuArchColumn = {
  title: t('CPU Arch'),
  dataIndex: 'cpu_arch',
  isHideable: true,
};

export const gpuColumns = [
  {
    title: t('GPU Type'),
    dataIndex: 'gpuType',
    isHideable: true,
  },
  {
    title: t('GPU Count'),
    dataIndex: 'gpuCount',
    isHideable: true,
  },
  {
    title: t('NUMA Nodes'),
    dataIndex: 'hw:numa_nodes',
    isHideable: true,
  },
  {
    title: t('CPU Policy'),
    dataIndex: 'hw:cpu_policy',
    isHideable: true,
    valueMap: cpuPolicyList,
  },
  {
    title: t('CPU Thread Policy'),
    dataIndex: 'hw:cpu_thread_policy',
    isHideable: true,
    valueMap: cpuThreadPolicyMap,
  },
  {
    title: t('Memory Page'),
    dataIndex: 'hw:mem_page_size',
    isHideable: true,
    valueMap: pageTypeMap,
  },
];

export const getAllArchitecture = (data, withCustom = true) => {
  const architectures = [];
  try {
    const item = (data || []).find((it) => it.key === 'flavor_families');
    ((item && item.value) || []).forEach((it) => {
      if (it.architecture) {
        architectures.push(it.architecture);
      }
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
  }
  if (withCustom) {
    architectures.push('custom');
  }
  return architectures;
};

export const getFamilyItemValue = (data) => {
  const item = (data || []).find((it) => it.key === 'flavor_families');
  return item ? item.value : [];
};

export const isBareMetal = (architecture) => architecture === 'bare_metal';

export const isBareMetalFlavor = (data) => {
  const { extra_specs: extra = {} } = data.originData || data || {};
  return (
    isBareMetal(extra[':architecture']) ||
    extra['trait:CUSTOM_GOLD'] === 'required'
  );
};

export const getFlavorArchInfo = (flavor) => {
  const { architecture = '', category = '' } = flavor || {};
  if (!architecture) {
    return '-';
  }
  if (architecture === 'custom') {
    return flavorArchitectures[architecture];
  }
  return `${flavorArchitectures[architecture] || architecture} - ${
    flavorCategoryList[category] || category
  }`;
};

export const getFlavorSearchFilters = (category) => {
  const filters = [
    {
      label: t('Name'),
      name: 'name',
    },
    {
      label: t('CPU'),
      name: 'vcpus',
      filterFunc: (vcpus, value) => {
        return (`${vcpus}` || '').includes(value);
      },
    },
    {
      label: t('Memory'),
      name: 'ram',
      filterFunc: (ram, value) => {
        return (formatSize(ram, 2) || '').includes(value);
      },
    },
  ];
  if (category) {
    filters.push({
      label: t('Category'),
      name: 'category',
      options: getOptions(category),
    });
  }

  return filters;
};
