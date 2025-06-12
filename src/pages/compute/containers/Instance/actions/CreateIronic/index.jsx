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
import { InputNumber, Badge } from 'antd';
import { StepAction } from 'containers/Action';
import globalServerStore from 'stores/nova/instance';
import globalProjectStore from 'stores/keystone/project';
import classnames from 'classnames';
import { isEmpty, isFinite } from 'lodash';
import {
  getUserData,
  canCreateIronicByEndpoint,
  hashPasswordForCloudInit,
} from 'resources/nova/instance';
import { ironicOriginEndpoint } from 'client/client/constants';
import Notify from 'components/Notify';
import styles from './index.less';
import ConfirmStep from './ConfirmStep';
import SystemStep from './SystemStep';
import NetworkStep from './NetworkStep';
import BaseStep from './BaseStep';

export class CreateIronic extends StepAction {
  static id = 'ironic-create';

  static title = t('Create Ironic Instance');

  static path = (_, containerProps) => {
    const { detail, match } = containerProps || {};
    if (!detail || isEmpty(detail)) {
      return '/compute/ironic-instance/create';
    }
    if (match.path.indexOf('/compute/server') >= 0) {
      return `/compute/ironic-instance/create?servergroup=${detail.id}`;
    }
  };

  init() {
    this.store = globalServerStore;
    this.projectStore = globalProjectStore;
    this.getQuota();
  }

  static policy = [
    'os_compute_api:servers:create',
    'os_compute_api:os-availability-zone:list',
  ];

  static allowed(_, containerProps) {
    const { isAdminPage = false } = containerProps;
    const { match } = containerProps || {};
    const inServerGroupDetailPage = match.path.indexOf('/compute/server') >= 0;
    return Promise.resolve(
      !inServerGroupDetailPage && !isAdminPage && canCreateIronicByEndpoint()
    );
  }

  async getQuota() {
    await this.projectStore.fetchProjectQuota({
      project_id: this.currentProjectId,
    });
    this.onCountChange(1);
  }

  get quota() {
    const { instances = {} } = toJS(this.projectStore.quota) || {};
    const { limit = 10, used = 0 } = instances;
    if (limit === -1) {
      return Infinity;
    }
    return limit - used;
  }

  get name() {
    return t('Create ironic instance');
  }

  get listUrl() {
    const { image, volume, servergroup } = this.locationParams;
    if (image) {
      return this.getRoutePath('image');
    }
    if (volume) {
      return this.getRoutePath('volume');
    }
    if (servergroup) {
      return this.getRoutePath('serverGroupDetail', { id: servergroup });
    }
    return this.getRoutePath('instance');
  }

  get checkEndpoint() {
    return true;
  }

  get endpoint() {
    return ironicOriginEndpoint();
  }

  get hasConfirmStep() {
    return false;
  }

  get steps() {
    return [
      {
        title: t('Base Config'),
        component: BaseStep,
      },
      {
        title: t('Network Config'),
        component: NetworkStep,
      },
      {
        title: t('System Config'),
        component: SystemStep,
      },
      {
        title: t('Confirm Config'),
        component: ConfirmStep,
      },
    ];
  }

  get instanceName() {
    const { name, count = 1 } = this.values || {};
    if (count === 1) {
      return name;
    }
    return new Array(count)
      .fill(count)
      .map((_, index) => `${name}-${index + 1}`)
      .join(', ');
  }

  get successText() {
    return t(
      'The creation instruction was issued successfully, instance: {name}. \n You can wait for a few seconds to follow the changes of the list data or manually refresh the data to get the final display result.',
      { action: this.name.toLowerCase(), name: this.instanceName }
    );
  }

  get errorText() {
    const { status } = this.state;
    if (status === 'error') {
      return t(
        'Unable to create instance: insufficient quota to create resources.'
      );
    }
    if (this.ipBatchError) {
      return t(
        'Unable to create instance: batch creation is not supported when specifying IP.'
      );
    }
    return t(
      'The creation instruction has been issued, please refresh to see the actual situation in the list.'
    );
  }

  onCountChange = (value) => {
    const { data } = this.state;
    let msg = t('Quota: Project quotas sufficient resources can be created');
    let status = 'success';
    if (isFinite(this.quota) && value > this.quota) {
      msg = t(
        'Quota: Insufficient quota to create resources, please adjust resource quantity or quota(left { quota }, input { input }).',
        { quota: this.quota, input: value }
      );
      status = 'error';
    }
    this.msg = msg;
    this.setState({
      data: {
        ...data,
        count: value,
      },
      status,
    });
  };

  renderBadge() {
    const { status = 'success' } = this.state;
    if (status === 'success') {
      return null;
    }
    return (
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <Badge status={status} text={this.msg} />
      </div>
    );
  }

  renderExtra() {
    return null;
  }

  getCountInputConfig() {
    return {
      min: 1,
      max: 100,
      precision: 0,
      onChange: this.onCountChange,
      formatter: (value) => `$ ${value}`.replace(/\D/g, ''),
    };
  }

  renderCountInput() {
    const { data } = this.state;
    const { count = 1 } = data || {};
    const configs = this.getCountInputConfig();
    return (
      <div className={styles['number-input']}>
        <span>{t('Count')}</span>
        <InputNumber
          {...configs}
          value={count}
          className={classnames(styles.input, 'instance-count')}
        />
      </div>
    );
  }

  renderFooterLeft() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {this.renderCountInput()}
          {this.renderExtra()}
        </div>
        {this.renderBadge()}
      </div>
    );
  }

  getSubmitData(values) {
    const { status } = this.state;
    if (status === 'error') {
      return null;
    }
    /* eslint-disable no-unused-vars */
    const {
      availableZone,
      bootableVolume,
      dataDisk,
      host,
      image,
      instanceSnapshot,
      iso,
      keypair,
      loginType,
      network,
      networks,
      password,
      physicalNode,
      physicalNodeType,
      project,
      resource,
      securityGroup,
      source,
      flavor,
      systemDisk,
      userData = '',
      serverGroup,
      name,
      count = 1,
    } = values;
    const imageRef = image.selectedRowKeys[0];
    // const rootVolume = {
    //   boot_index: 0,
    //   uuid: imageRef,
    //   source_type: 'image',
    //   // volume_size: size,
    //   destination_type: 'volume',
    //   // volume_type: type,
    //   // delete_on_termination: deleteType === 1,
    // };
    let hasIp = false;
    const { selectedRows: securityGroupSelectedRows = [] } =
      securityGroup || {};
    const server = {
      security_groups: securityGroupSelectedRows.map((it) => ({
        name: it.id,
      })),
      name,
      flavorRef: flavor.selectedRowKeys[0],
      availability_zone: availableZone.value,
      // block_device_mapping_v2: [rootVolume],
      networks: networks.map((it) => {
        const net = {
          uuid: it.value.network,
        };
        if (it.value.ipType === 1 && it.value.ip) {
          net.fixed_ip = it.value.ip;
          hasIp = true;
        }
        return net;
      }),
    };
    if (hasIp && count > 1) {
      this.ipBatchError = true;
      return Promise.reject();
    }
    if (imageRef) {
      server.imageRef = imageRef;
    }
    if (loginType.value === 'keypair') {
      server.key_name = keypair.selectedRowKeys[0];
    } else {
      server.adminPass = password;
    }
    if (count > 1) {
      server.min_count = count;
      server.max_count = count;
      server.return_reservation_id = true;
    }
    if (server.adminPass || userData) {
      const { username } = values;
      server.user_data = btoa(
        getUserData(server.adminPass, userData, username || 'root')
      );
    }
    if (server.adminPass) {
      server.adminPass = hashPasswordForCloudInit(server.adminPass);
    }
    return {
      server,
    };
  }

  onSubmit = (body) => {
    if (!body) {
      return Promise.reject();
    }
    return this.store.create(body);
  };

  onOk = () => {
    const { data } = this.state;
    this.values = data;
    const submitData = this.getSubmitData(data);
    this.onSubmit(submitData).then(
      () => {
        this.routing.push(this.listUrl);
        Notify.success(this.successText);
      },
      (err) => {
        const { response: { data: responseData } = {} } = err;
        const { forbidden: { message = '' } = {} } = responseData || {};
        if (
          message &&
          typeof message === 'string' &&
          message.indexOf('Quota exceeded') !== -1
        ) {
          Notify.error(t('Quota exceeded'));
        } else {
          Notify.errorWithDetail(responseData, this.errorText);
        }
      }
    );
  };
}

export default inject('rootStore')(observer(CreateIronic));
