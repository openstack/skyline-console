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
import globalImageStore from 'stores/glance/image';
import globalAvailabilityZoneStore from 'stores/nova/zone';
import {
  canImageCreateIronicInstance,
  getImageSystemTabs,
  getImageOS,
  getImageColumns,
} from 'resources/glance/image';
import Base from 'components/Form';
import FlavorSelectTable from '../../../components/FlavorSelectTable';

export class BaseStep extends Base {
  init() {
    this.imageStore = globalImageStore;
    this.getAvailZones();
    this.getImages();
  }

  get title() {
    return 'BaseStep';
  }

  get name() {
    return 'BaseStep';
  }

  get isStep() {
    return true;
  }

  get defaultValue() {
    const source = this.sourceTypes[0];
    const values = {
      systemDisk: this.defaultVolumeType,
      source,
      project: this.currentProjectName,
      dataDisk: [],
    };
    return values;
  }

  get sourceTypes() {
    return [{ label: t('Image'), value: 'image' }];
  }

  get availableZones() {
    return (globalAvailabilityZoneStore.list.data || [])
      .filter((it) => it.zoneState.available)
      .map((it) => ({
        value: it.zoneName,
        label: it.zoneName,
      }));
  }

  get images() {
    const { imageTab } = this.state;
    const { image } = this.locationParams;
    const data = image
      ? [toJS(this.imageStore.detail)]
      : this.imageStore.list.data || [];
    const images = data.filter((it) => {
      if (!canImageCreateIronicInstance(it)) {
        return false;
      }
      if (imageTab) {
        return getImageOS(it) === imageTab;
      }
      return it;
    });
    return images.map((it) => ({
      ...it,
      key: it.id,
    }));
  }

  allowed = () => Promise.resolve();

  async getAvailZones() {
    await globalAvailabilityZoneStore.fetchListWithoutDetail();
    if (this.availableZones.length) {
      this.updateFormValue('availableZone', this.availableZones[0]);
    }
  }

  async getImages() {
    const { image } = this.locationParams;
    if (image) {
      await this.imageStore.fetchDetail({ id: image });
    } else {
      await this.imageStore.fetchList({ all_projects: this.hasAdminRole });
    }
    if (image) {
      this.updateFormValue('image', {
        selectedRowKeys: [image],
        selectedRows: this.images.filter((it) => it.id === image),
      });
    }
  }

  onImageTabChange = (value) => {
    this.setState({
      imageTab: value,
    });
  };

  get systemTabs() {
    return getImageSystemTabs();
  }

  checkSystemDisk = (rule, value) => {
    if (!value.type) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('');
    }
    return Promise.resolve();
  };

  get nameForStateUpdate() {
    return ['image', 'flavor'];
  }

  onFlavorChange = (value) => {
    this.updateContext({
      flavor: value,
    });
  };

  get formItems() {
    const { image } = this.locationParams;
    const imageLoading = image
      ? this.imageStore.isLoading
      : this.imageStore.list.isLoading;
    return [
      {
        name: 'project',
        label: t('Project'),
        type: 'label',
      },
      {
        name: 'availableZone',
        label: t('Available Zone'),
        type: 'select',
        placeholder: t('Please select'),
        isWrappedValue: true,
        required: true,
        options: this.availableZones,
        tip: t(
          'Availability zone refers to a physical area where power and network are independent of each other in the same area. In the same region, the availability zone and the availability zone can communicate with each other in the intranet, and the available zones can achieve fault isolation.'
        ),
      },
      {
        type: 'divider',
      },
      {
        name: 'flavor',
        label: t('Specification'),
        type: 'select-table',
        component: (
          <FlavorSelectTable isIronic="true" onChange={this.onFlavorChange} />
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
        name: 'image',
        label: t('Operating System'),
        type: 'select-table',
        data: this.images,
        isLoading: imageLoading,
        required: true,
        filterParams: [
          {
            label: t('Name'),
            name: 'name',
          },
        ],
        columns: getImageColumns(this),
        tabs: this.systemTabs,
        defaultTabValue:
          this.locationParams.os_distro || this.systemTabs[0].value,
        selectedLabel: t('Image'),
        onTabChange: this.onImageTabChange,
      },
    ];
  }
}

export default inject('rootStore')(observer(BaseStep));
