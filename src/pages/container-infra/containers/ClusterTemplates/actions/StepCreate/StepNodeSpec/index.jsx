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
import globalImageStore from 'src/stores/glance/image';
import globalKeypairStore from 'src/stores/nova/keypair';
import FlavorSelectTable from 'src/pages/compute/containers/Instance/components/FlavorSelectTable';
import {
  getImageColumns,
  getImageSystemTabs,
  getImageOS,
} from 'resources/glance/image';

export class StepNodeSpec extends Base {
  init() {
    this.getImageList();
  }

  get title() {
    return t('Node Spec');
  }

  get name() {
    return t('Node Spec');
  }

  get isStep() {
    return true;
  }

  get isEdit() {
    return !!this.props.extra;
  }

  async getImageList() {
    await globalImageStore.fetchList();
    this.updateDefaultValue();
  }

  get acceptedImageOs() {
    const { context: { coe = '' } = {} } = this.props;
    let acceptedOs = [];
    if (coe === 'kubernetes') {
      acceptedOs = ['fedora', 'coreos'];
    } else if (['swarm', 'swarm-mode'].includes(coe)) {
      acceptedOs = ['fedora'];
    } else if (['mesos', 'dcos'].includes(coe)) {
      acceptedOs = ['ubuntu'];
    }
    return acceptedOs;
  }

  get imageColumns() {
    return getImageColumns(this);
  }

  get systemTabs() {
    const imageTabs = getImageSystemTabs();
    return imageTabs.filter((it) => this.acceptedImageOs.includes(it.value));
  }

  onImageTabChange = (value) => {
    this.setState({
      imageTab: value,
    });
  };

  get imageList() {
    const { imageTab } = this.state;
    return (globalImageStore.list.data || [])
      .filter(
        (it) =>
          it.owner === this.currentProjectId &&
          this.acceptedImageOs.includes(it.os_distro)
      )
      .filter((it) => getImageOS(it) === imageTab);
  }

  get volumeDrivers() {
    const { context: { coe = '' } = {} } = this.props;
    let acceptedVolumeDriver = [];
    if (coe === 'kubernetes') {
      acceptedVolumeDriver = [{ value: 'cinder', label: 'Cinder' }];
    } else if (['swarm', 'mesos'].includes(coe)) {
      acceptedVolumeDriver = [{ value: 'rexray', label: 'Rexray' }];
    }
    return acceptedVolumeDriver;
  }

  onFlavorChange = (value) => {
    this.updateContext({
      flavor: value,
    });
  };

  get defaultValue() {
    let values = {};

    if (this.isEdit) {
      const {
        extra: {
          image_id,
          keypair_id,
          flavor_id,
          master_flavor_id,
          volume_driver,
          docker_storage_driver,
          docker_volume_size,
        } = {},
      } = this.props;
      values = {
        volume_driver,
        docker_storage_driver,
        docker_volume_size,
      };
      if (flavor_id) {
        values.flavor = { selectedRowKeys: [flavor_id] };
      }
      if (master_flavor_id) {
        values.masterFlavor = { selectedRowKeys: [master_flavor_id] };
      }
      if (image_id) {
        values.images = { selectedRowKeys: [image_id] };
      }
      if (keypair_id) {
        values.keypairs = { selectedRowKeys: [keypair_id] };
      }
    }
    return values;
  }

  get minVolumeSize() {
    const { docker_storage_driver } = this.state;
    return docker_storage_driver === 'devicemapper' ? 3 : 1;
  }

  get nameForStateUpdate() {
    return ['docker_storage_driver'];
  }

  get formItems() {
    return [
      {
        name: 'images',
        label: t('Image'),
        type: 'select-table',
        data: this.imageList,
        required: true,
        isLoading: globalImageStore.list.isLoading,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: this.imageColumns,
        tabs: this.systemTabs,
        defaultTabValue: this.systemTabs[0].value,
        onTabChange: this.onImageTabChange,
        imageTabAuto: true,
      },
      {
        name: 'keypairs',
        label: t('Keypair'),
        type: 'select-table',
        data: this.keypairsList,
        isLoading: globalKeypairStore.list.isLoading,
        tip: t(
          'The SSH key is a way to remotely log in to the instance. The cloud platform only helps to keep the public key. Please keep your private key properly.'
        ),
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: [
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Fingerprint'),
            dataIndex: 'fingerprint',
          },
        ],
      },
      {
        name: 'flavor',
        label: t('Flavor'),
        type: 'select-table',
        component: <FlavorSelectTable onChange={this.onFlavorChange} />,
      },
      {
        name: 'masterFlavor',
        label: t('Master Flavor'),
        type: 'select-table',
        component: <FlavorSelectTable onChange={this.onFlavorChange} />,
      },
      {
        name: 'volume_driver',
        label: t('Volume Driver'),
        type: 'select',
        options: this.volumeDrivers,
      },
      {
        name: 'docker_storage_driver',
        label: t('Docker Storage Driver'),
        type: 'select',
        options: [
          {
            label: t('Devicemapper'),
            value: 'devicemapper',
          },
          {
            label: t('Overlay'),
            value: 'overlay',
          },
          {
            label: t('Overlay2'),
            value: 'overlay2',
          },
        ],
        onChange: () => {
          this.resetFormValue(['docker_volume_size']);
        },
      },
      {
        name: 'docker_volume_size',
        label: t('Docker Volume Size (GiB)'),
        type: 'input-int',
        min: this.minVolumeSize,
        required: this.minVolumeSize === 3,
        placeholder: t('Spec'),
        validator: (rule, value) => {
          if (
            this.minVolumeSize === 3 &&
            (!value || value < this.minVolumeSize)
          ) {
            return Promise.reject(
              new Error(
                t('The min size is {size} GiB', { size: this.minVolumeSize })
              )
            );
          }
          return Promise.resolve();
        },
      },
    ];
  }
}

export default inject('rootStore')(observer(StepNodeSpec));
