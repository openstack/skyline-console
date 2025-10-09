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
import {
  Algorithm,
  algorithmTip,
  OvnPoolAlgorithm,
} from 'resources/octavia/pool';
import { poolProtocols } from 'resources/octavia/lb';

export class PoolStep extends Base {
  get title() {
    return 'Pool Detail';
  }

  get name() {
    return 'Pool Detail';
  }

  get isStep() {
    return true;
  }

  get isOVN() {
    const { context: { provider } = {} } = this.props;
    return provider === 'ovn';
  }

  get filterOptions() {
    const { context: { listener_protocol = '' } = {} } = this.props;
    return poolProtocols.filter((it) => listener_protocol.includes(it.label));
  }

  allowed = () => Promise.resolve();

  init() {
    const { context: { provider } = {} } = this.props;
    const defaultAlgo = provider === 'ovn' ? 'SOURCE_IP_PORT' : undefined;
    this.state = {
      pool_lb_algorithm: defaultAlgo,
    };
  }

  handleAlgorithmChange = (e) => {
    this.setState({
      pool_lb_algorithm: e,
    });
  };

  get defaultValue() {
    const { context: { provider } = {} } = this.props;
    return {
      pool_admin_state_up: true,
      ...(provider === 'ovn' && { pool_lb_algorithm: 'SOURCE_IP_PORT' }),
    };
  }

  get formItems() {
    const { pool_lb_algorithm } = this.state;
    return [
      {
        name: 'pool_name',
        label: t('Pool Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'pool_description',
        label: t('Pool Description'),
        type: 'textarea',
      },
      {
        name: 'pool_lb_algorithm',
        label: t('Pool Algorithm'),
        type: 'select',
        options: this.isOVN ? OvnPoolAlgorithm : Algorithm,
        onChange: this.handleAlgorithmChange,
        extra: pool_lb_algorithm && algorithmTip[pool_lb_algorithm],
        required: true,
      },
      {
        name: 'pool_protocol',
        label: t('Pool Protocol'),
        type: 'select',
        options: this.isOVN
          ? this.filterOptions.filter((it) => ['TCP', 'UDP'].includes(it.value))
          : this.filterOptions,
        onChange: () => {
          this.updateContext({
            health_type: '',
          });
        },
        required: true,
      },
      {
        name: 'pool_admin_state_up',
        label: t('Admin State Up'),
        type: 'switch',
        tip: t('Defines the admin state of the pool.'),
      },
    ];
  }
}

export default inject('rootStore')(observer(PoolStep));
