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
import Base from 'components/Form';
import { healthProtocols } from 'resources/octavia/lb';

export class HealthMonitorStep extends Base {
  get title() {
    return 'Health Monitor Detail';
  }

  get name() {
    return 'Health Monitor Detail';
  }

  get isStep() {
    return true;
  }

  get isOVN() {
    const { context: { provider } = {} } = this.props;
    return provider === 'ovn';
  }

  get filteredProtocolOptions() {
    const { context: { listener_protocol = '' } = {} } = this.props;
    const base = healthProtocols.filter((it) =>
      listener_protocol.includes(it.label)
    );
    return this.isOVN
      ? base.filter((it) => ['TCP', 'UDP-CONNECT'].includes(it.value))
      : base;
  }

  get defaultValue() {
    return {
      enableHealthMonitor: true,
      health_delay: 5,
      health_timeout: 3,
      health_max_retries: 3,
      health_type: '',
      monitor_admin_state_up: true,
      health_url_path: '/',
    };
  }

  handleHealthTypeChange = (value) => {
    this.setState({
      health_type: value,
    });
  };

  allowed = () => Promise.resolve();

  get formItems() {
    const { health_delay, enableHealthMonitor, health_type } = this.state;
    return [
      {
        name: 'enableHealthMonitor',
        label: t('Enable Health Monitor'),
        type: 'radio',
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
        name: 'health_name',
        label: t('Health Monitor Name'),
        type: 'input-name',
        required: true,
        hidden: !enableHealthMonitor,
      },
      {
        name: 'health_delay',
        label: t('Health Monitor Delay'),
        type: 'input-number',
        onChange: (val) => {
          this.setState({
            health_delay: val,
          });
        },
        min: 0,
        extra: t('Maximum interval time for each health check response'),
        required: true,
        hidden: !enableHealthMonitor,
      },
      {
        name: 'health_max_retries',
        label: t('Health Monitor Max Retries'),
        type: 'input-number',
        min: 1,
        max: 10,
        extra: t(
          'That is, after how many consecutive failures of the health check, the health check status of the back-end cloud server is changed from normal to abnormal'
        ),
        required: true,
        hidden: !enableHealthMonitor,
      },
      {
        name: 'health_timeout',
        label: t('Health Monitor Timeout'),
        type: 'input-number',
        min: health_delay || 0,
        extra: t(
          'The timeout period of waiting for the return of the health check request, the check timeout will be judged as a check failure'
        ),
        required: true,
        hidden: !enableHealthMonitor,
      },
      {
        name: 'health_type',
        label: t('Health Monitor Type'),
        type: 'select',
        options: this.filteredProtocolOptions,
        required: true,
        hidden: !enableHealthMonitor,
        onChange: this.handleHealthTypeChange,
      },
      {
        name: 'monitor_admin_state_up',
        label: t('Admin State Up'),
        type: 'switch',
        tip: t('Defines the admin state of the health monitor.'),
        hidden: !enableHealthMonitor,
      },
      {
        name: 'health_url_path',
        label: t('Monitoring URL'),
        type: 'input',
        rules: [
          { required: false },
          {
            validator: (_, value) => {
              if (value && !value.startsWith('/')) {
                return Promise.reject(new Error(t('URL must start with /')));
              }
              return Promise.resolve();
            },
          },
        ],
        initialValue: '/',
        placeholder: t('e.g., /status.html or /healthcheck.html'),
        extra: t(
          'Defaults to "/" if left blank. Recommended: use a dedicated status page like "/status.html". This option is not applicable for TCP and UDP health monitor types.'
        ),
        hidden: !enableHealthMonitor || this.isOVN,
        disabled: health_type === 'TCP' || health_type === 'UDP-CONNECT',
      },
    ];
  }
}

export default inject('rootStore')(observer(HealthMonitorStep));
