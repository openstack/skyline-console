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
import { toJS } from 'mobx';
import globalInstancesStore from 'stores/trove/instances';
import globalAvailabilityZoneStore from 'stores/nova/zone';
import FlavorSelectTable from 'pages/compute/containers/Instance/components/FlavorSelectTable';

export class StepDetails extends Base {
  init() {
    this.instancesStore = globalInstancesStore;
    this.getDatastores();
    this.getAvailZones();
  }

  get title() {
    return t('Details *');
  }

  get name() {
    return 'Details';
  }

  allowed = () => Promise.resolve();

  get nameForStateUpdate() {
    return ['flavor', 'datastore_type'];
  }

  get defaultValue() {
    const values = {
      project: this.currentProjectName,
    };
    return values;
  }

  get availableZones() {
    return (globalAvailabilityZoneStore.list.data || [])
      .filter((it) => it.zoneState.available)
      .map((it) => ({
        value: it.zoneName,
        label: it.zoneName,
      }));
  }

  async getAvailZones() {
    globalAvailabilityZoneStore.fetchListWithoutDetail();
  }

  get datastores() {
    return (globalInstancesStore.dataList || []).map((it) => ({
      label: it.name,
      value: it.name,
      originData: toJS(it),
    }));
  }

  async getDatastores() {
    globalInstancesStore.listDatastores();
  }

  onChangeDatastoresTypeChange = (value) => {
    this.setState({
      datastoreType: value,
    });
    this.resetFormValue(['datastore_version']);
  };

  get datastoresVersion() {
    const dizi = this.datastores
      .filter((item) => item.label === this.state.datastore_type)
      .map((it) => {
        return it.originData.versions.map((e) => ({
          label: e.name,
          value: e.name,
        }));
      });
    return dizi[0];
  }

  getFlavorComponent() {
    return <FlavorSelectTable onChange={this.onFlavorChange} />;
  }

  onFlavorChange = (value) => {
    this.updateContext({
      flavor: value,
    });
  };

  checkSystemDisk = (rule, value) => {
    if (!value.type) {
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject('');
    }
    return Promise.resolve();
  };

  getSystemDiskMinSize() {
    const flavorSize = (this.state.flavor || {}).disk || 0;
    const imageSize = 0;
    return Math.max(flavorSize, imageSize, 1);
  }

  onSystemDiskChange = (value) => {
    this.updateContext({
      volume_type: value,
    });
  };

  get formItems() {
    return [
      {
        name: 'project',
        label: t('Project'),
        type: 'label',
      },
      {
        type: 'divider',
      },
      {
        name: 'zone',
        label: t('Availability Zone'),
        type: 'select',
        placeholder: t('Please select'),
        options: this.availableZones,
        required: true,
      },
      {
        name: 'instance_name',
        label: t('Instance Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'size',
        label: t('Size (GiB)'),
        type: 'input-int',
        min: 1,
        max: 50,
        placeholder: t('Size'),
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
        type: 'divider',
      },
      {
        name: 'datastore_type',
        label: t('Datastore Type'),
        type: 'select',
        options: this.datastores,
        onChange: (value) => {
          this.onChangeDatastoresTypeChange(value);
        },
        required: true,
        tip: t('Type of datastore'),
      },
      {
        name: 'datastore_version',
        label: t('Datastore Version'),
        type: 'select',
        options: this.datastoresVersion,
        required: true,
        tip: t('Version of datastore'),
      },
      {
        type: 'divider',
      },
      {
        name: 'flavor',
        label: t('Flavor'),
        component: this.getFlavorComponent(),
        wrapperCol: {
          xs: {
            span: 24,
          },
          sm: {
            span: 18,
          },
        },
        tip: t('Size of image to launch'),
        required: true,
      },
      {
        name: 'locality',
        label: t('Locality'),
        type: 'select',
        options: [
          {
            label: t('Affinity'),
            value: 'affinity',
          },
          {
            label: t('Anti-Affinity'),
            value: 'anti-affinity',
          },
        ],
        tip: t(
          'Specify whether future replicated instances will be created on the same hypervisor (affinity) or on different hypervisors (anti-affinity). This value is ignored if the instance to be launched is a replica.'
        ),
      },
    ];
  }
}

export default inject('rootStore')(observer(StepDetails));
