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
import Base from 'containers/BaseDetail';
import {
  categoryHasIOPS,
  categoryHasEphemeral,
  isGpuCategory,
  isComputeOptimized,
  cpuPolicyList,
  cpuThreadPolicyMap,
  pageTypeMap,
  isBareMetal,
} from 'resources/nova/flavor';

export class BaseDetail extends Base {
  get leftCards() {
    const { category, disk, usbType } = this.detailData;
    const isGPUType = isGpuCategory(category);
    const typeIsComputeOptimized = isComputeOptimized(category);
    const cards = [this.baseInfoCard];
    if (disk) {
      cards.push(this.diskCard);
    }
    if (isGPUType) {
      cards.push(this.gpuCard);
    }
    if (usbType !== '-') {
      cards.push(this.usbCard);
    }
    if (typeIsComputeOptimized) {
      cards.push(this.ComputeOptimizedCard);
    }
    return cards;
  }

  get rightCards() {
    return [this.jsonCard];
  }

  getBareMetalCard() {
    const options = [
      {
        label: t('Resource Class Properties'),
        dataIndex: 'extra_specs_traits',
        render: () => {
          const { originData: { extra_specs: extra = {} } = {} } =
            this.detailData;
          const traitKeys = Object.keys(extra).filter(
            (it) => it.indexOf('resources:') === 0
          );
          return traitKeys.map((it) => {
            const value = extra[it];
            return (
              <div key={it}>{`${it.replace('resources:', '')} = ${value}`}</div>
            );
          });
        },
      },
      {
        label: t('Trait Properties'),
        dataIndex: 'extra_specs_traits',
        render: () => {
          const { originData: { extra_specs: extra = {} } = {} } =
            this.detailData;
          const traitKeys = Object.keys(extra).filter(
            (it) => it.indexOf('trait:') === 0
          );
          return traitKeys.map((it) => {
            const value = extra[it];
            return (
              <div key={it}>{`${it.replace('trait:', '')} = ${value}`}</div>
            );
          });
        },
      },
    ];
    return {
      title: t('Base Info'),
      options,
    };
  }

  get baseInfoCard() {
    const { category, architecture } = this.detailData;
    const hasIOPS = categoryHasIOPS(category);
    const hasEphemeral = categoryHasEphemeral(category);
    const typeIsComputeOptimized = isComputeOptimized(category);
    if (isBareMetal(architecture)) {
      return this.getBareMetalCard();
    }
    const options = [
      {
        label: t('Internal Network Bandwidth (Gbps)'),
        dataIndex: 'quota:vif_outbound_average',
        render: (value) => {
          if (!value) {
            return '-';
          }
          return value / 1000 / 125;
        },
      },
    ];
    if (hasEphemeral) {
      options.push({
        label: t('Ephemeral Disk (GiB)'),
        dataIndex: 'OS-FLV-EXT-DATA:ephemeral',
      });
    }
    if (hasIOPS) {
      options.push({
        label: t('Storage IOPS'),
        dataIndex: 'quota:disk_total_iops_sec',
        render: (value) => {
          if (!value) {
            return '-';
          }
          return value;
        },
      });
    }
    if (!typeIsComputeOptimized) {
      const numaItem = {
        label: t('NUMA Node Count'),
        dataIndex: 'hw:numa_nodes',
      };
      const memPageItem = {
        label: t('Memory Page Size'),
        dataIndex: 'hw:mem_page_size',
        render: (value) => (value && pageTypeMap[value]) || value || '-',
      };
      options.push(...[numaItem, memPageItem]);
    }

    return {
      title: t('Base Info'),
      options,
    };
  }

  get diskCard() {
    const options = [
      {
        label: t('Root Disk (GiB)'),
        dataIndex: 'disk',
      },
    ];
    return {
      title: t('Disk Info'),
      options,
    };
  }

  get gpuCard() {
    const options = [
      {
        label: t('GPU Type'),
        dataIndex: 'gpuType',
      },
      {
        label: t('GPU Count'),
        dataIndex: 'gpuCount',
      },
    ];
    return {
      title: t('GPU Info'),
      options,
    };
  }

  get usbCard() {
    const options = [
      {
        label: t('Usb Controller'),
        dataIndex: 'usbType',
      },
      {
        label: t('Number of Usb Controller'),
        dataIndex: 'usbCount',
      },
    ];
    return {
      title: t('USB Info'),
      options,
    };
  }

  get ComputeOptimizedCard() {
    const numa = [
      {
        label: t('NUMA Node Count'),
        dataIndex: 'hw:numa_nodes',
      },
    ];
    const nodes = this.detailData['hw:numa_nodes'] || 0;
    const details = new Array(nodes).map((_, index) => {
      const cpu = this.detailData[`hw:numa_cpus.${index}`];
      const mem = this.detailData[`hw:numa_mem.${index}`];
      return {
        label: `${t('NUMA Node')}-${index + 1}`,
        dataIndex: `hw:numa_nodes.${index}`,
        render: () => (
          <div key={`hw:numa_nodes.${index}`}>
            <span style={{ marginRight: 16 }}>
              {t('CPU')} : {cpu}
            </span>
            {t('Mem')} : {mem}MiB
          </div>
        ),
      };
    });
    numa.push(...details);
    const others = [
      {
        label: t('CPU Policy'),
        dataIndex: 'hw:cpu_policy',
        valueMap: cpuPolicyList,
      },
      {
        label: t('CPU Thread Policy'),
        dataIndex: 'hw:cpu_thread_policy',
        valueMap: cpuThreadPolicyMap,
      },
      {
        label: t('Memory Page Size'),
        dataIndex: 'hw:mem_page_size',
        valueMap: pageTypeMap,
      },
    ];
    const options = [...numa, ...others];
    return {
      title: t('Compute Optimized Info'),
      options,
    };
  }

  get jsonCard() {
    const { originData } = this.detailData;
    const content = (
      <div>
        <pre>{JSON.stringify(originData, null, 4)}</pre>
      </div>
    );
    const options = [
      {
        label: '',
        content,
      },
    ];
    return {
      labelCol: 0,
      title: t('Parameter'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
