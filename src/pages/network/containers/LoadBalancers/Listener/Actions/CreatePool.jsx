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
import globalLbaasStore from 'stores/octavia/loadbalancer';
import {
  Algorithm,
  OvnPoolAlgorithm,
  algorithmTip,
} from 'resources/octavia/pool';
import { poolProtocols } from 'resources/octavia/lb';

export class CreatePool extends ModalAction {
  static id = 'pool-create';

  static title = t('Create Default Pool');

  static buttonText = t('Create Default Pool');

  get name() {
    return t('create default pool');
  }

  get labelCol() {
    return {
      xs: { span: 8 },
      sm: { span: 8 },
    };
  }

  get isOVN() {
    const { detail } = this.props.containerProps || {};
    const lbDetail = this.item.loadBalancer || detail;
    return lbDetail && lbDetail.provider === 'ovn';
  }

  static policy = 'os_load-balancer_api:pool:post';

  static allowed = async (item, containerProps) => {
    const { detail } = containerProps || {};
    let lbDetail = item.loadBalancer || detail;
    if (!lbDetail) {
      lbDetail = await globalLbaasStore.pureFetchDetail(item.loadbalancers[0]);
    }
    return Promise.resolve(
      !item.default_pool_id &&
        item.provisioning_status === 'ACTIVE' &&
        lbDetail.provisioning_status === 'ACTIVE'
    );
  };

  get filterOptions() {
    const { protocol = '' } = this.item;
    return poolProtocols.filter((it) => protocol.includes(it.label));
  }

  init() {
    this.state = {
      algorithm: undefined,
    };
  }

  handleAlgorithmChange = (e) => {
    this.setState({
      algorithm: e,
    });
  };

  get defaultValue() {
    return {
      admin_state_up: true,
    };
  }

  get formItems() {
    const { algorithm } = this.state;
    return [
      {
        name: 'name',
        label: t('Pool Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'description',
        label: t('Pool Description'),
        type: 'textarea',
      },
      {
        name: 'lb_algorithm',
        label: t('Pool Algorithm'),
        type: 'select',
        options: this.isOVN ? OvnPoolAlgorithm : Algorithm,
        onChange: this.handleAlgorithmChange,
        extra: algorithm && algorithmTip[algorithm],
        required: true,
      },
      {
        name: 'protocol',
        label: t('Pool Protocol'),
        type: 'select',
        options: this.filterOptions,
        required: true,
      },
      {
        name: 'admin_state_up',
        label: t('Admin State Up'),
        type: 'switch',
        tip: t('Defines the admin state of the pool.'),
      },
    ];
  }

  onSubmit = (values) => {
    values.listener_id = this.item.id;
    return globalPoolStore.create(values);
  };
}

export default inject('rootStore')(observer(CreatePool));
