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
import { ModalAction } from 'containers/Action';
import { PoolMemberStore } from 'stores/octavia/pool-member';
import { VirtualAdapterStore } from 'stores/neutron/virtual-adapter';
import { Input } from 'antd';
import { portStatus, portSortProps } from 'resources/port';

@inject('rootStore')
@observer
export default class MemberManagement extends ModalAction {
  constructor(props) {
    super(props);
    this.state = {
      memberUpdateValue: [],
    };
  }

  static id = 'manage-mamber';

  static title = t('Manage Member');

  get name() {
    return t('Manage Member');
  }

  static policy = 'os_load-balancer_api:member:put';

  static allowed = (item) =>
    Promise.resolve(item.provisioning_status === 'ACTIVE');

  init() {
    this.store = new VirtualAdapterStore();
    this.memberStore = new PoolMemberStore();
    this.state.sgInitValue = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.getMember();
  }

  static get modalSize() {
    return 'large';
  }

  async getMember() {
    // const virtualAdapter = this.store.list;
    const { default_pool_id } = this.item;
    const members = await this.memberStore.fetchList({
      pool_id: default_pool_id,
    });
    // const { members } = res;
    const memberInitValue = {
      selectedRowKeys: members.map((it) => it.address),
      selectedRows: members.map((it) => {
        it.id = it.address;
        it.member_ip = it.address;
        return it;
      }),
    };
    this.setState({
      memberInitValue,
    });
    this.updateFormValue('Member', memberInitValue);
  }

  getModalSize() {
    return 'large';
  }

  get item() {
    const { item } = this.props;
    if (!item) {
      return this.containerProps.detail;
    }
    return item;
  }

  get defaultValue() {
    return {};
  }

  get formItems() {
    const { memberInitValue, memberUpdateValue } = this.state;
    return [
      {
        name: 'Member',
        label: t('Member'),
        type: 'select-table',
        backendPageStore: this.store,
        extraParams: {
          device_owner: ['compute:nova', ''],
          addressAsIdKey: true,
        },
        initValue: memberInitValue,
        required: true,
        isMulti: true,
        tagKey: 'member_ip',
        ...portSortProps,
        // filterParams:
        columns: [
          {
            title: t('IP'),
            dataIndex: 'id',
          },
          {
            title: t('Name'),
            dataIndex: 'name',
          },
          {
            title: t('Attach Instance'),
            dataIndex: 'server_name',
            sorter: false,
          },
          {
            title: t('IPv4 Address'),
            dataIndex: 'ipv4',
            render: (value) => value.map((it) => <div key={it}>{it}</div>),
            isHideable: true,
            stringify: (value) => value.join(','),
            sorter: false,
          },
          {
            title: t('IPv6 Address'),
            dataIndex: 'ipv6',
            render: (value) => value.map((it) => <div key={it}>{it}</div>),
            isHideable: true,
            stringify: (value) => value.join(','),
            sorter: false,
          },
          {
            title: t('Status'),
            dataIndex: 'status',
            render: (value) => portStatus[value] || value,
          },
          {
            title: t('Port'),
            dataIndex: 'protocol_port',
            sorter: false,
            render: (text, record) => {
              const { selectedRows } = memberInitValue;
              const updateMember = memberUpdateValue.filter(
                (it) => record.id === it.id
              )[0];
              const member = selectedRows.filter(
                (it) => record.id === it.id
              )[0];
              const defaultValue = member ? member.protocol_port : text;
              const value = updateMember
                ? updateMember.protocol_port
                : defaultValue;
              return (
                <Input
                  style={{ width: '50%' }}
                  onChange={(e) =>
                    this.handleChange(
                      Number(e.target.value),
                      record,
                      'protocol_port'
                    )
                  }
                  defaultValue={value}
                  type="number"
                />
              );
            },
          },
          {
            title: t('Weight'),
            dataIndex: 'weight',
            sorter: false,
            render: (text, record) => {
              const { selectedRows } = memberInitValue;
              const updateMember = memberUpdateValue.filter(
                (it) => record.id === it.id
              )[0];
              const member = selectedRows.filter(
                (it) => record.id === it.id
              )[0];
              const defaultValue = member ? member.weight : text;
              const value = updateMember ? updateMember.weight : defaultValue;
              return (
                <Input
                  style={{ width: '50%' }}
                  onChange={(e) =>
                    this.handleChange(Number(e.target.value), record, 'weight')
                  }
                  value={value}
                  type="number"
                />
              );
            },
          },
        ],
      },
    ];
  }

  // handleChange = (value, record, title) => {
  //   const { memberUpdateValue, memberInitValue: { selectedRows } } = this.state;
  //   const update = memberUpdateValue.filter(it => record.id === it.id);
  //   if (update[0]) {
  //     memberUpdateValue.map((member) => {
  //       if (record.id === member.id) {
  //         member[title] = value;
  //       }
  //       return member;
  //     });
  //   } else {
  //     // const member = selectedRows.filter(it => record.id === it.id)[0];
  //     // const { weight, protocol_port } = member;
  //     // record.weight = weight;
  //     // record.protocol_port = protocol_port;
  //     record[title] = value;
  //     memberUpdateValue.push(record);
  //   }
  //   this.setState(memberUpdateValue);
  // }

  onSubmit = (values) => {
    const { default_pool_id } = this.item;
    const {
      Member: { selectedRowKeys: address_group = [], selectedRows } = {},
    } = values;
    const { memberUpdateValue } = this.state;
    const members = address_group.map((address) => {
      let inputData = memberUpdateValue.filter((it) => it.id === address)[0];
      if (!inputData) {
        inputData = selectedRows.filter((it) => it.id === address)[0];
      }
      const { weight, protocol_port } = inputData;
      const ip_address = { weight, protocol_port, address };
      return ip_address;
    });
    return this.memberStore.batchUpdate({ default_pool_id, data: members });
  };
}
