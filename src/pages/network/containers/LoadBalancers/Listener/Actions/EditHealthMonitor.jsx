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
import { ModalAction } from 'containers/Action';
import globalHealthMonitorStore, {
  HealthMonitorStore,
} from 'stores/octavia/health-monitor';
import { healthProtocols } from 'resources/octavia/lb';
import { PoolStore } from 'stores/octavia/pool';
import globalLbaasStore from 'stores/octavia/loadbalancer';
import { ListenerStore } from 'stores/octavia/listener';

export class EditHealthMonitor extends ModalAction {
  init() {
    this.store = new HealthMonitorStore();
    this.listenerStore = new ListenerStore();
    this.poolStore = new PoolStore();
    this.state = {
      enableHealthMonitor: false,
      dataLoading: true,
      healthMonitor: null,
      healthType: '',
    };
  }

  componentDidMount() {
    this.getHealthMonitor();
  }

  static id = 'health-monitor-edit';

  static title = t('Edit Health Monitor');

  static buttonText = t('Edit Health Monitor');

  get name() {
    return t('edit health monitor');
  }

  get labelCol() {
    return {
      xs: { span: 8 },
      sm: { span: 8 },
    };
  }

  get filteredProtocolOptions() {
    const { protocol = '' } = this.item;
    return healthProtocols.filter((it) => protocol.includes(it.label));
  }

  handleHealthTypeChange = (value) => {
    this.setState({
      healthType: value,
    });
  };

  get defaultValue() {
    const { healthMonitor } = this.state;
    if (!healthMonitor) {
      return {
        delay: 5,
        timeout: 3,
        max_retries: 3,
        enableHealthMonitor: false,
        admin_state_up: true,
        url_path: '/',
      };
    }
    const {
      admin_state_up,
      operating_status,
      type,
      delay,
      timeout,
      max_retries,
      url_path,
    } = healthMonitor;
    return {
      enableHealthMonitor: true,
      admin_state_up,
      operating_status,
      type,
      delay,
      timeout,
      max_retries,
      url_path,
    };
  }

  static policy = 'os_load-balancer_api:healthmonitor:put';

  static allowed = async (item, containerProps) => {
    const { detail } = containerProps || {};
    let lbDetail = item.loadBalancer || detail;
    if (!lbDetail) {
      lbDetail = await globalLbaasStore.pureFetchDetail(item.loadbalancers[0]);
    }
    return Promise.resolve(
      !!item.default_pool_id &&
        item.provisioning_status === 'ACTIVE' &&
        lbDetail.provisioning_status === 'ACTIVE'
    );
  };

  async getHealthMonitor() {
    const detail = await this.listenerStore.fetchDetail(this.item);
    const { healthMonitor } = detail;
    this.setState(
      {
        healthMonitor,
        enableHealthMonitor: !!healthMonitor,
        healthType: healthMonitor?.type || '',
        dataLoading: false,
      },
      () => {
        this.updateDefaultValue();
      }
    );
  }

  get formItems() {
    const { enableHealthMonitor, dataLoading, healthMonitor, healthType } =
      this.state;
    if (dataLoading) {
      return [
        {
          name: 'loading',
          type: 'loading',
        },
      ];
    }
    return [
      {
        name: 'enableHealthMonitor',
        label: t('Enable Health Monitor'),
        type: 'radio',
        required: true,
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
        name: 'type',
        label: t('HealthMonitor Type'),
        type: 'select',
        options: this.filteredProtocolOptions,
        hidden: !enableHealthMonitor,
        required: true,
        disabled: !!healthMonitor,
        onChange: this.handleHealthTypeChange,
      },
      {
        name: 'delay',
        label: t('Delay Interval(s)'),
        type: 'input-int',
        min: 0,
        extra: t('Maximum interval time for each health check response'),
        hidden: !enableHealthMonitor,
        required: true,
      },
      {
        name: 'timeout',
        label: t('Timeout(s)'),
        type: 'input-int',
        min: 0,
        extra: t(
          'The timeout period of waiting for the return of the health check request, the check timeout will be judged as a check failure'
        ),
        hidden: !enableHealthMonitor,
        required: true,
      },
      {
        name: 'max_retries',
        label: t('Max Retries'),
        type: 'input-int',
        min: 0,
        extra: t(
          'That is, after how many consecutive failures of the health check, the health check status of the back-end cloud server is changed from normal to abnormal'
        ),
        hidden: !enableHealthMonitor,
        required: true,
      },
      {
        name: 'admin_state_up',
        label: t('Admin State Up'),
        type: 'switch',
        tip: t('Defines the admin state of the health monitor.'),
        hidden: !enableHealthMonitor,
      },
      {
        name: 'url_path',
        label: t('Monitoring URL'),
        type: 'input',
        required: false,
        validator: (_, value) => {
          if (value && !value.startsWith('/')) {
            return Promise.reject(new Error(t('URL must start with /')));
          }
          return Promise.resolve();
        },
        placeholder: t('e.g., /status.html or /healthcheck.html'),
        extra: t(
          'Defaults to "/" if left blank. Recommended: use a dedicated status page like "/status.html". This option is not applicable for TCP and UDP health monitor types.'
        ),
        hidden: !enableHealthMonitor,
        disabled: healthType === 'TCP' || healthType === 'UDP-CONNECT',
      },
    ];
  }

  onSubmit = (values) => {
    const { default_pool_id } = this.item;
    const { healthMonitor } = this.state;
    const { id } = healthMonitor || {};
    const { enableHealthMonitor, type, url_path, ...others } = values;
    const updatedUrlPath = url_path ?? '/';
    if (id) {
      if (!enableHealthMonitor) {
        return globalHealthMonitorStore.delete({ id });
      }
      // Exclude url_path from payload when TCP or UDP-CONNECT is selected
      const editData = { ...others };
      if (type !== 'TCP' && type !== 'UDP-CONNECT') {
        editData.url_path = updatedUrlPath;
      }
      return globalHealthMonitorStore.edit({ id }, editData);
    }
    if (!enableHealthMonitor) {
      return Promise.resolve();
    }
    const data = {
      type,
      ...others,
      pool_id: default_pool_id,
    };
    // Exclude url_path from payload when TCP or UDP-CONNECT is selected
    if (type !== 'TCP' && type !== 'UDP-CONNECT') {
      data.url_path = updatedUrlPath;
    }
    return globalHealthMonitorStore.create(data);
  };
}

export default inject('rootStore')(observer(EditHealthMonitor));
