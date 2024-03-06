// Copyright 2021 99cloud
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unles //required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { StepAction } from 'containers/Action';
import { inject, observer } from 'mobx-react';
import globalInstancesStore from 'stores/trove/instances';
import globalProjectStore from 'stores/keystone/project';
import { message as $message } from 'antd';
import StepDetails from './StepDetails';
import StepNetworking from './StepNetworking';
import StepInitializeDatabases from './StepInitializeDatabases';
import StepAdvanced from './StepAdvanced';

export class StepCreate extends StepAction {
  init() {
    this.store = globalInstancesStore;
    this.projectStore = globalProjectStore;
    this.getQuota();
    this.state.isLoading = true;
    this.errorMsg = '';
  }

  static id = 'create-database-instance';

  static title = t('Create Database Instance');

  static path = '/database/instances/create';

  static policy = 'instance:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Database Instance');
  }

  get listUrl() {
    return this.getRoutePath('databaseInstances');
  }

  get hasConfirmStep() {
    return false;
  }

  get steps() {
    return [
      {
        title: t('Details *'),
        component: StepDetails,
      },
      {
        title: t('Networking *'),
        component: StepNetworking,
      },
      {
        title: t('Initialize Databases'),
        component: StepInitializeDatabases,
      },
      {
        title: t('Advanced'),
        component: StepAdvanced,
      },
    ];
  }

  get showQuota() {
    return this.props.rootStore.hasAdminOnlyRole;
  }

  async getQuota() {
    if (this.showQuota) {
      await this.projectStore.fetchProjectTroveQuota(this.currentProjectId);
      this.setState({
        isLoading: false,
      });
    }
  }

  get quotaInfo() {
    if (this.state.isLoading) {
      return [];
    }
    const { instances = {}, volumes = {} } = this.projectStore.troveQuota || {};

    const { left = 0 } = instances || {};
    const { data: { size = 0 } = {} } = this.state;
    const instanceQuotaInfo = {
      ...instances,
      add: left ? 1 : 0,
      name: 'instance',
      title: t('Database Instance'),
    };

    const { left: volumeLeft = 0 } = volumes;
    const volumeSizeQuotaInfo = {
      ...volumes,
      add: volumeLeft === -1 || size <= volumeLeft ? size : 0,
      name: 'volumeSize',
      title: t('Database Disk (GiB)'),
      type: 'line',
    };

    this.checkQuota(this.state.data, this.projectStore.troveQuota);
    return [instanceQuotaInfo, volumeSizeQuotaInfo];
  }

  getQuotaMessage(input, left, name) {
    if (left === -1) {
      return '';
    }
    if (left === 0) {
      return t('Quota: Insufficient { name } quota to create resources.', {
        name,
      });
    }
    if (input > left) {
      return t(
        'Insufficient {name} quota to create resources (left { quota }, input { input }).',
        { name, quota: left, input }
      );
    }
    return '';
  }

  checkQuota(data, quota) {
    const {
      instances: { left: instanceLeft = 0 } = {},
      volumes: { left: volumeLeft = 0 } = {},
    } = quota || {};
    const { size = 0 } = data || {};

    const instanceMsg = this.getQuotaMessage(
      1,
      instanceLeft,
      t('Database Instance')
    );
    const sizeMsg = this.getQuotaMessage(
      size,
      volumeLeft,
      t('Database Disk (GiB)')
    );

    if (!instanceMsg && !sizeMsg) {
      this.errorMsg = '';
    } else {
      const msg = instanceMsg || sizeMsg;
      if (this.errorMsg !== msg) {
        $message.error(msg);
      }
      this.errorMsg = msg;
    }
  }

  get disableNext() {
    return !!this.errorMsg;
  }

  get disableSubmit() {
    return !!this.errorMsg;
  }

  onSubmit = (values) => {
    let network = [];

    const { selectedRowKeys = [] } = values.network;
    network = selectedRowKeys.map((it) => ({ 'net-id': it }));
    network = [{ 'net-id': selectedRowKeys[0] }];

    return this.store.create({
      instance: {
        datastore: {
          type: values.datastore_type,
          version: values.datastore_version,
        },
        name: values.instance_name,
        flavorRef: values.flavor.selectedRowKeys[0],
        volume: { size: values.size },
        availability_zone: values.zone,
        nics: network,
        locality: values.locality,
        configuration: values.configurationGroup,
        databases: [
          {
            character_set: 'utf8',
            collate: 'utf8_general_ci',
            name: values.initialDatabases,
          },
        ],
        users: [
          {
            databases: [
              {
                name: values.initialDatabases,
              },
            ],
            name: values.initialAdminUser,
            password: values.password,
          },
        ],
      },
    });
  };
}

export default inject('rootStore')(observer(StepCreate));
