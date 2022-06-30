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

import { ModalAction } from 'containers/Action';
import { inject, observer } from 'mobx-react';
import globalInstancesStore from 'stores/trove/instances';
import globalConfigurationsStore from 'stores/trove/configurations';
import { toJS } from 'mobx';

export class Create extends ModalAction {
  init() {
    this.store = globalConfigurationsStore;
    this.getDatastores();
    this.state.datastore_type = null;
  }

  static id = 'create-configurations';

  static title = t('Create Configurations');

  static get modalSize() {
    return 'middle';
  }

  getModalSize() {
    return 'middle';
  }

  get name() {
    return t('Create Configurations');
  }

  static policy = 'configuration:create';

  static allowed() {
    return Promise.resolve(true);
  }

  async getDatastores() {
    await globalInstancesStore.listDatastores();
  }

  get datastores() {
    return (globalInstancesStore.dataList || []).map((it) => ({
      label: it.name,
      value: it.name,
      originData: toJS(it),
    }));
  }

  onChangeDatastoresTypeChange = (value) => {
    this.setState({
      datastore_type: value,
    });
    this.resetFormValue(['datastore_version']);
  };

  get datastoresVersion() {
    const dizi = this.datastores
      .filter((item) => item.label === this.state.datastore_type)
      .map((it) => {
        return it.originData.versions.map((e) => ({
          label: e.name,
          value: e.name,
        }));
      });
    return dizi[0];
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input',
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'input',
      },
      {
        name: 'datastore_type',
        label: t('Datastore Type'),
        type: 'select',
        options: this.datastores,
        onChange: (value) => {
          this.onChangeDatastoresTypeChange(value);
        },
        required: true,
      },
      {
        name: 'datastore_version',
        label: t('Datastore Version'),
        type: 'select',
        options: this.datastoresVersion,
        required: true,
      },
    ];
  }

  onSubmit = (values) => {
    return this.store.create({
      configuration: {
        description: values.description,
        datastore: {
          type: values.datastore_type,
          version: values.datastore_version,
        },
        name: values.name,
        values: {
          connect_timeout: 200,
        },
      },
    });
  };
}

export default inject('rootStore')(observer(Create));
