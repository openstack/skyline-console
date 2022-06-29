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
import StepDetails from './StepDetails';
import StepNetworking from './StepNetworking';
import StepInitializeDatabases from './StepInitializeDatabases';
import StepAdvanced from './StepAdvanced';

export class StepCreate extends StepAction {
  init() {
    this.store = globalInstancesStore;
  }

  static id = 'create-instance';

  static title = t('Create Instance');

  static path = '/database/instances/create';

  static policy = 'instance:create';

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t('Create Instance');
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
