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
import Base from 'components/Form';
import { physicalNodeTypes } from 'resources/nova/instance';
import { Col, Row } from 'antd';
import { getAllDataDisks } from 'resources/cinder/snapshot';

export class ConfirmStep extends Base {
  init() {}

  get title() {
    return 'ConfirmStep';
  }

  get name() {
    return 'ConfirmStep';
  }

  get isStep() {
    return true;
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  allowed = () => Promise.resolve();

  getDisk(diskInfo, bootFromVolume, selectedInstanceSnapshot) {
    if (!bootFromVolume) {
      return null;
    }

    const { size, typeOption, deleteTypeLabel } = diskInfo || {};

    if (selectedInstanceSnapshot) {
      const sizeGiB = selectedInstanceSnapshot.min_disk ?? 0;
      return `${typeOption.label} ${sizeGiB}GiB ${deleteTypeLabel}`;
    }

    return `${typeOption.label} ${size}GiB ${deleteTypeLabel}`;
  }

  getBootableVolumeDisk() {
    const { bootableVolume } = this.props.context;
    const { size, volume_type } = bootableVolume.selectedRows[0];
    return `${volume_type} ${size}GiB`;
  }

  getDeleteVolumeInstance() {
    const { deleteVolumeInstance } = this.props?.context;
    return deleteVolumeInstance ? t('Yes') : t('No');
  }

  getSystemDisk() {
    if (!this.enableCinder) return null;
    const { context } = this.props;
    const {
      systemDisk,
      source: { value } = {},
      instanceSnapshotDisk,
      bootFromVolume = true,
    } = context;
    if (value === 'bootableVolume') {
      return this.getBootableVolumeDisk();
    }
    if (value === 'instanceSnapshot' && instanceSnapshotDisk !== null) {
      const selectedInstanceSnapshot =
        context.instanceSnapshot?.selectedRows?.[0];
      return this.getDisk(
        instanceSnapshotDisk,
        bootFromVolume,
        selectedInstanceSnapshot
      );
    }
    return this.getDisk(systemDisk, bootFromVolume);
  }

  getDataDisk() {
    if (!this.enableCinder) return null;
    const { context } = this.props;
    const {
      dataDisk = [],
      source: { value } = {},
      instanceSnapshotDataVolumes = [],
    } = context;
    let allDataDisks = dataDisk;
    if (
      value === 'instanceSnapshot' &&
      instanceSnapshotDataVolumes?.length > 0
    ) {
      allDataDisks = getAllDataDisks({ dataDisk, instanceSnapshotDataVolumes });
    }
    return allDataDisks.map((it) => this.getDisk(it.value, true));
  }

  getFlavor() {
    const { context } = this.props;
    const { flavor } = context;
    const { disk, ram, vcpus } = flavor.selectedRows[0];
    return disk
      ? `${vcpus}VCPU/${disk}GiB/${Number.parseInt(ram / 1024, 10)}GiB`
      : `${vcpus}VCPU/${Number.parseInt(ram / 1024, 10)}GiB`;
  }

  getSourceValue() {
    const { context } = this.props;
    const { source } = context;
    const { selectedRows = [], selectedRowKeys = [] } = context[source.value];
    return selectedRows.length ? selectedRows[0].name : selectedRowKeys[0];
  }

  getVirtualLANs() {
    const { context } = this.props;
    const { networks = [] } = context;
    const values = networks.map((it) => {
      const { networkOption, subnetOption, ipTypeOption, ip } = it.value;
      const subnet =
        ipTypeOption.value === 1 ? subnetOption.name || subnetOption.label : '';
      return `${networkOption.name || networkOption.label} ${
        ipTypeOption.label
      } ${subnet} ${ipTypeOption.value === 1 ? ip : ''}`;
    });
    return (
      <Row>
        {values.map((i) => (
          <Col span={24} key={i}>
            {i}
          </Col>
        ))}
      </Row>
    );
  }

  getPorts() {
    const { context } = this.props;
    const { ports: { selectedRows = [] } = {} } = context;
    const values = selectedRows.map((it) => it.name || it.id);
    return (
      <Row>
        {values.map((i) => (
          <Col span={24} key={i}>
            {i}
          </Col>
        ))}
      </Row>
    );
  }

  getSecurityGroups() {
    const { context } = this.props;
    const { securityGroup: { selectedRows = [] } = {} } = context;
    const values = selectedRows.map((it) => it.name);
    return (
      <Row>
        {values.map((i) => (
          <Col span={24} key={i}>
            {i}
          </Col>
        ))}
      </Row>
    );
  }

  getLoginType() {
    const { context } = this.props;
    const { loginType, keypair } = context;
    const { value, label } = loginType;
    return `${label} ${
      value === 'keypair' ? keypair.selectedRows[0].name : ''
    }`;
  }

  getPhysicalNode() {
    const { context } = this.props;
    const { physicalNodeType, physicalNode } = context;
    if (!physicalNodeType) {
      return physicalNodeTypes[0].label;
    }
    if (physicalNodeType.value === 'smart') {
      return physicalNodeType.label;
    }
    return physicalNode.selectedRows[0].hypervisor_hostname;
  }

  getServerGroup() {
    const { context } = this.props;
    const { serverGroup } = context;
    if (!serverGroup || !serverGroup.selectedRows.length) {
      return '-';
    }
    return serverGroup.selectedRows[0].name;
  }

  getIso() {
    const { context } = this.props;
    const { iso } = context;
    if (!iso || iso.length === 0) {
      return '-';
    }
    const values = iso.map((it) => it.value);
    return values.join(' ');
  }

  goStep(index) {
    const { goStep } = this.props;
    goStep && goStep(index);
  }

  get defaultValue() {
    return {};
  }

  get formItems() {
    const { context } = this.props;
    let baseItems = [
      // {
      //   label: t('Resource Pool'),
      //   value: context.resource,
      // },
      {
        label: t('Start Source'),
        value: context.source.label,
      },
      {
        label: t('System Disk'),
        value: this.getSystemDisk(),
      },
      {
        label: t('Delete Volume on Instance Delete'),
        value: this.getDeleteVolumeInstance(),
        key: 'deleteVolume',
      },
      {
        label: t('Available Zone'),
        value: context.availableZone.label,
      },
      {
        label: t('Start Source Name'),
        value: this.getSourceValue(),
      },
      {
        label: t('Data Disk'),
        value: this.getDataDisk(),
        contentStyle: { display: 'inline-block' },
      },
      {
        label: t('Project'),
        value: context.project,
      },
      {
        label: t('Flavor'),
        value: this.getFlavor(),
      },
    ];
    if (!this.enableCinder) {
      baseItems = baseItems.filter(
        (it) => ![t('System Disk'), t('Data Disk')].includes(it.label)
      );
    }
    if (context.source.value.toUpperCase() !== 'BOOTABLEVOLUME') {
      baseItems = baseItems.filter((it) => it?.key !== 'deleteVolume');
    }
    return [
      {
        name: 'confirm-count',
        label: t('Count'),
        type: 'label',
        content: context.count || 1,
      },
      {
        name: 'confirm-config',
        label: t('Config Overview'),
        type: 'descriptions',
        title: t('Base Config'),
        onClick: () => {
          this.goStep(0);
        },
        items: baseItems,
      },
      {
        type: 'short-divider',
      },
      {
        name: 'confirm-config-network',
        label: ' ',
        type: 'descriptions',
        title: t('Network Config'),
        onClick: () => {
          this.goStep(1);
        },
        items: [
          {
            label: `${t('Virtual LAN')}(${t('New')})`,
            value: this.getVirtualLANs(),
            span: 1,
          },
          {
            label: `${t('Virtual LAN')}(${t('Created')})`,
            value: this.getPorts(),
            span: 1,
          },
          {
            label: t('Security Group'),
            value: this.getSecurityGroups(),
            span: 1,
          },
        ],
      },
      {
        type: 'short-divider',
      },
      {
        name: 'confirm-config-system',
        label: ' ',
        type: 'descriptions',
        title: t('System Config'),
        onClick: () => {
          this.goStep(2);
        },
        items: [
          {
            label: t('Name'),
            value: context.name,
          },
          {
            label: t('Login Type'),
            value: this.getLoginType(),
          },
          {
            label: t('Physical Node'),
            value: this.getPhysicalNode(),
          },
          {
            label: t('Server Group'),
            value: this.getServerGroup(),
          },
          // {
          //   label: t('Mount ISO'),
          //   value: this.getIso(),
          // },
        ],
      },
    ];
  }
}

export default inject('rootStore')(observer(ConfirmStep));
