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
import Base from 'components/Form';
import globalHostStore from 'src/stores/masakari/hosts';
import globalComputeHostStore from 'src/stores/nova/compute-host';
import { Input, Switch } from 'antd';

export class StepHost extends Base {
  init() {
    this.store = globalHostStore;
    this.state = {
      host: [],
      hostLoading: true,
      ...this.state,
    };

    this.getHostList();
  }

  get title() {
    return 'StepHost';
  }

  get name() {
    return 'StepHost';
  }

  get isStep() {
    return true;
  }

  allowed = () => Promise.resolve();

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
          this.setState({ host: [...this.state.host, newHost] });
        }
        flag = false;
      });
    }

    const hostMap = Object.fromEntries(
      this.state.host.map((host) => [host.id, host])
    );
    this.setState({ hostMap, hostLoading: false });
  }

  get getHostName() {
    return (this.state.host || []).map((it) => ({
      value: it.host,
      label: it.host,
    }));
  }

  get formItems() {
    const columns = [
      { title: t('Name'), dataIndex: 'host' },
      { title: t('Zone'), dataIndex: 'zone' },
      {
        title: t('Updated'),
        dataIndex: 'updated_at',
        valueRender: 'toLocalTime',
      },
      {
        name: 'reserved',
        title: t('Reserved'),
        dataIndex: 'reserved',
        required: true,
        render: (reserved, row) => (
          <Switch
            checked={reserved}
            onChange={(checked) => {
              this.setState((prevState) => {
                const host = prevState.hostMap;
                host[row.id].reserved = checked;
                return { hostMap: host };
              });
            }}
          />
        ),
      },
      {
        name: 'type',
        title: t('Type'),
        dataIndex: 'type',
        required: true,
        render: (type, row) => (
          <Input
            required
            defaultValue={type}
            onChange={(e) => {
              const { value } = e.target;
              this.setState((prevState) => {
                const host = prevState.hostMap;
                host[row.id].type = value;
                return { hostMap: host };
              });
            }}
          />
        ),
      },
      {
        name: 'control_attributes',
        title: t('Control Attributes'),
        dataIndex: 'control_attributes',
        render: (control_attribute, row) => (
          <Input
            defaultValue={control_attribute}
            required
            onChange={(e) => {
              const { value } = e.target;
              this.setState((prevState) => {
                const host = prevState.hostMap;
                host[row.id].control_attributes = value;
                return { hostMap: host };
              });
            }}
          />
        ),
      },
      {
        name: 'on_maintenance',
        title: t('On Maintenance'),
        dataIndex: 'on_maintenance',
        render: (maintain, row) => (
          <Switch
            checked={maintain}
            onChange={(checked) => {
              this.setState((prevState) => {
                const host = prevState.hostMap;
                host[row.id].on_maintenance = checked;
                return { hostMap: host };
              });
            }}
          />
        ),
      },
    ];

    return [
      {
        name: 'name',
        label: t('Host Name'),
        type: 'select-table',
        required: true,
        data: this.state.host,
        isMulti: true,
        onRow: () => {},
        columns,
        isLoading: this.state.hostLoading,
        filterParams: [
          { label: t('Name'), name: 'host' },
          { label: t('Zone'), name: 'zone' },
        ],
      },
    ];
  }
}

export default inject('rootStore')(observer(StepHost));
