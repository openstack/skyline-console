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

export class EditHealthMonitor extends ModalAction {
  init() {
    this.store = new HealthMonitorStore();
    this.poolStore = new PoolStore();
    this.state = {
      defaultData: true,
      admin_state_up: false,
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

  get defaultValue() {
    const { operating_status, type, delay, timeout, max_retries } =
      this.store.detail;
    const { defaultData, admin_state_up } = this.state;
    if (defaultData && operating_status && this.formRef.current) {
      this.formRef.current.setFieldsValue({
        admin_state_up,
        operating_status,
        type,
        delay,
        timeout,
        max_retries,
      });
      this.setState({ defaultData: false });
    }
    return {
      delay: 5,
      timeout: 3,
      max_retries: 3,
    };
  }

  static policy = 'os_load-balancer_api:healthmonitor:put';

  static allowed = async (item, containerProps) => {
    let { detail: lbDetail } = containerProps || {};
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
    const { default_pool_id } = this.item;
    const pool = await this.poolStore.fetchDetail({ id: default_pool_id });
    const { healthmonitor_id } = pool;
    if (healthmonitor_id) {
      const { admin_state_up } = await this.store.fetchDetail({
        id: healthmonitor_id,
      });
      this.setState({ admin_state_up });
      this.formRef.current.setFieldsValue({ admin_state_up });
    }
  }

  get tips() {
    const { healthmonitor_id } = this.poolStore.detail || {};
    if (!healthmonitor_id) {
      return t(
        'First time edit automatically creates health monitor When pool does not have a health monitor'
      );
    }
    return '';
  }

  get formItems() {
    const { admin_state_up } = this.state;
    const { healthmonitor_id } = this.poolStore.detail || {};
    return [
      {
        name: 'admin_state_up',
        label: t('Enable HealthMonitor'),
        type: 'radio',
        required: true,
        // onlyRadio: true,
        // isWrappedValue: true,
        options: [
          {
            label: t('Yes'),
            value: true,
          },
          ...(healthmonitor_id
            ? [
                {
                  label: t('No'),
                  value: false,
                },
              ]
            : []),
        ],
      },
      {
        name: 'type',
        label: t('HealthMonitor Type'),
        type: 'select',
        options: this.filteredProtocolOptions,
        hidden: !admin_state_up && healthmonitor_id,
        required: true,
        disabled: !!healthmonitor_id,
      },
      {
        name: 'delay',
        label: t('Delay Interval(s)'),
        type: 'input-int',
        min: 0,
        extra: t('Maximum interval time for each health check response'),
        hidden: !admin_state_up && healthmonitor_id,
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
        hidden: !admin_state_up && healthmonitor_id,
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
        hidden: !admin_state_up && healthmonitor_id,
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { default_pool_id } = this.item;
    const { healthmonitor_id: id } = this.poolStore.detail || {};
    if (id) {
      const { type, ...others } = values;
      return globalHealthMonitorStore.edit({ id }, others);
    }
    values.pool_id = default_pool_id;
    return globalHealthMonitorStore.create(values);
  };
}

export default inject('rootStore')(observer(EditHealthMonitor));
