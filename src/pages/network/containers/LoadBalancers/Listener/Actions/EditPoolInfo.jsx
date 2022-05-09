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
import globalPoolStore from 'stores/octavia/pool';
import { Algorithm } from 'resources/octavia/pool';
import { poolProtocols } from 'resources/octavia/lb';
import globalLbaasStore from 'stores/octavia/loadbalancer';

export class EditPoolInfo extends ModalAction {
  init() {
    this.state.pool = {};
    this.store = globalPoolStore;
    this.getPoolDetail();
  }

  static id = 'pool-edit';

  static title = t('Edit Default Pool');

  static buttonText = t('Edit Default Pool');

  get name() {
    return t('edit default pool');
  }

  get labelCol() {
    return {
      xs: { span: 8 },
      sm: { span: 8 },
    };
  }

  get filteredProtocolOptions() {
    const { pool: { protocol = '' } = {} } = this.state;
    return poolProtocols.filter((it) => protocol.includes(it.label));
  }

  get defaultValue() {
    const { pool } = this.state;
    const { name, description, protocol, lb_algorithm } = pool;
    if (name && this.formRef.current) {
      this.formRef.current.setFieldsValue({
        name,
        description,
        protocol,
        lb_algorithm,
      });
    }
    return {
      name,
      description,
      protocol,
      lb_algorithm,
    };
  }

  static policy = 'os_load-balancer_api:pool:put';

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

  async getPoolDetail() {
    const { default_pool_id } = this.item;
    const pool = await this.store.fetchDetail({ id: default_pool_id });
    this.setState({ pool });
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        maxLength: 255,
      },
      {
        name: 'protocol',
        label: t('Protocol'),
        type: 'select',
        options: this.filteredProtocolOptions,
        required: true,
      },
      {
        name: 'lb_algorithm',
        label: t('LB Algorithm'),
        type: 'select',
        options: Algorithm,
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    const { default_pool_id } = this.item;
    const { protocol, ...others } = values;
    return this.store.edit({ id: default_pool_id }, others);
  };
}

export default inject('rootStore')(observer(EditPoolInfo));
