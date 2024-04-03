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
import { ModalAction } from 'src/containers/Action';
import globalHostStore from 'src/stores/masakari/hosts';
import globalComputeHostStore from 'src/stores/nova/compute-host';

export class AddHost extends ModalAction {
  init() {
    this.store = globalHostStore;
    this.state = {
      host: [],
    };
    this.getHostList();
  }

  static id = 'AddHost';

  static title = t('Add Host');

  get name() {
    return t('Add Host');
  }

  static policy = 'baremetal:port:create';

  static allowed = () => Promise.resolve(true);

  async getHostList() {
    const response = await globalComputeHostStore.fetchList({
      binary: 'nova-compute',
    });
    const hostList = await globalHostStore.fetchList();
    let flag = false;

    if (hostList.length < 1) {
      this.setState({
        host: response,
      });
    } else {
      response.forEach((newHost) => {
        for (let i = 0; i < hostList.length; i++) {
          if (hostList[i].name === newHost.host) {
            flag = true;
          }
        }
        if (!flag) {
          this.setState({
            host: [...this.state.host, newHost],
          });
        }
        flag = false;
      });
    }
  }

  get getHostName() {
    return (this.state.host || []).map((it) => ({
      value: it.host,
      label: it.host,
    }));
  }

  get defaultValue() {
    return {
      segment_name: this.item.name,
      reserved: false,
      on_maintenance: false,
    };
  }

  get formItems() {
    return [
      {
        name: 'segment_name',
        label: t('Segment Name'),
        type: 'input',
        disabled: true,
      },
      {
        name: 'name',
        label: t('Host Name'),
        type: 'select',
        options: this.getHostName,
        required: true,
      },
      {
        name: 'reserved',
        label: t('Reserved'),
        type: 'switch',
        checkedText: '',
        uncheckedText: '',
      },
      {
        name: 'type',
        label: t('Type'),
        type: 'input',
        required: true,
      },
      {
        name: 'control_attributes',
        label: t('Control Attributes'),
        type: 'input',
        required: true,
      },
      {
        name: 'on_maintenance',
        label: t('On Maintenance'),
        type: 'switch',
        checkedText: '',
        uncheckedText: '',
      },
    ];
  }

  onSubmit = (values) => {
    const { segment_name, ...submitData } = values;
    return this.store.create(this.item.uuid, { host: { ...submitData } });
  };
}

export default inject('rootStore')(observer(AddHost));
