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
import { exitPolicies } from 'resources/zun/container';
import ExposedPorts from '../../../components/ExposedPorts';

export class StepSpec extends Base {
  init() {
    this.getAvailabilityZones();
    this.state.disableRetry = true;
    this.checkDefaultQuota();
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

  get exitPoliciesOptions() {
    return Object.entries(exitPolicies).map(([k, v]) => ({
      label: v,
      value: k,
    }));
  }

  exposedPortValidator = (rule, value) => {
    const ifHaveEmpty = (value || []).some((it) => {
      const { value: innerValue } = it;
      if (innerValue?.port && innerValue?.protocol) {
        return false;
      }
      return true;
    });
    if (ifHaveEmpty) {
      return Promise.reject(new Error(t('Please input port and protocol')));
    }
    return Promise.resolve();
  };

  checkDefaultQuota() {
    this.updateContext(this.defaultValue);
  }

  get defaultValue() {
    return {
      cpu: 1,
      memory: 512,
      disk: 10,
    };
  }

  get formItems() {
    const { context: { exitPolicy, healthcheck } = {} } = this.props;
    const disableRetry = exitPolicy !== 'on-failure';

    return [
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
        options: this.exitPoliciesOptions,
        onChange: (value) =>
          this.updateContext({
            exitPolicy: value,
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
      {
        name: 'auto_remove',
        label: t('Enable auto remove'),
        type: 'check',
      },
      {
        name: 'interactive',
        label: t('Enable interactive mode'),
        type: 'check',
      },
      {
        name: 'healthcheck',
        label: t('Enable Health Check'),
        type: 'check',
        onChange: (value) =>
          this.updateContext({
            healthcheck: value,
          }),
      },
      {
        name: 'healthcheck_cmd',
        label: t('Health Check CMD'),
        extra: t('Command to run to check health'),
        type: 'input',
        min: 1,
        required: !!healthcheck,
        display: !!healthcheck,
      },
      {
        name: 'healthcheck_interval',
        label: t('Health Check Interval'),
        extra: t('Time between running the check in seconds'),
        type: 'input-int',
        min: 1,
        required: !!healthcheck,
        display: !!healthcheck,
      },
      {
        name: 'healthcheck_retries',
        label: t('Health Check Retries'),
        extra: t('Consecutive failures needed to report unhealthy'),
        type: 'input-int',
        min: 1,
        required: !!healthcheck,
        display: !!healthcheck,
      },
      {
        name: 'healthcheck_timeout',
        label: t('Health Check Timeout'),
        extra: t('Maximum time to allow one check to run in seconds'),
        type: 'input-int',
        min: 1,
        required: !!healthcheck,
        display: !!healthcheck,
      },
      {
        name: 'exposedPorts',
        label: t('Exposed Ports'),
        type: 'add-select',
        optionsProtocol: [
          { label: t('TCP'), value: 'tcp' },
          { label: t('UDP'), value: 'udp' },
        ],
        itemComponent: ExposedPorts,
        addText: t('Add Exposed Ports'),
        validator: this.exposedPortValidator,
        tip: t(
          'If this parameter is specified, Zun will create a security group with a set of rules to open the ports that should be exposed, and associate the security group to the container.'
        ),
      },
    ];
  }
}

export default inject('rootStore')(observer(StepSpec));
