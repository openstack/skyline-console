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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import globalAvailabilityZoneStore from 'stores/nova/zone';

export class StepSpec extends Base {
  init() {
    this.getAvailabilityZones();
    this.state.disableRetry = true;
  }

  get title() {
    return t('Spec');
  }

  get name() {
    return t('Spec');
  }

  async getAvailabilityZones() {
    await globalAvailabilityZoneStore.fetchListWithoutDetail();
  }

  get availabilityZoneList() {
    return (globalAvailabilityZoneStore.list.data || [])
      .filter((it) => it.zoneState.available)
      .map((it) => ({
        value: it.zoneName,
        label: it.zoneName,
      }));
  }

  get formItems() {
    const { disableRetry } = this.state;
    return [
      {
        name: 'hostname',
        label: t('Hostname'),
        type: 'input',
        placeholder: t('The host name of this container'),
      },
      {
        name: 'runtime',
        label: t('Runtime'),
        type: 'input',
        placeholder: t('The container runtime tool to create container with'),
      },
      {
        name: 'cpu',
        label: t('CPU (Core)'),
        type: 'input-int',
        tip: t('The number of virtual cpu for this container'),
        min: 1,
        onChange: (val) =>
          this.updateContext({
            cpu: val,
          }),
      },
      {
        name: 'memory',
        label: t('Memory (MiB)'),
        type: 'input-int',
        tip: t('The container memory size in MiB'),
        min: 4,
        onChange: (val) =>
          this.updateContext({
            memory: val,
          }),
      },
      {
        name: 'disk',
        label: t('Disk (GiB)'),
        type: 'input-int',
        tip: t('The disk size in GiB for per container'),
        min: 1,
        onChange: (val) =>
          this.updateContext({
            disk: val,
          }),
      },
      {
        name: 'availability_zone',
        label: t('Availability Zone'),
        type: 'select',
        options: this.availabilityZoneList,
      },
      {
        name: 'exitPolicy',
        label: t('Exit Policy'),
        type: 'select',
        options: [
          {
            label: t('No'),
            value: 'no',
          },
          {
            label: t('On failure'),
            value: 'on-failure',
          },
          {
            label: t('Always'),
            value: 'always',
          },
          {
            label: t('Unless Stopped'),
            value: 'unless-stopped',
          },
        ],
        onChange: (value) =>
          this.setState({
            disableRetry: value !== 'on-failure',
          }),
      },
      {
        name: 'maxRetry',
        label: t('Max Retry'),
        type: 'input-number',
        tip: t('Retry times for restart on failure policy'),
        min: 1,
        disabled: disableRetry,
      },
      {
        name: 'auto_heal',
        label: t('Enable auto heal'),
        type: 'check',
      },
    ];
  }
}

export default inject('rootStore')(observer(StepSpec));
