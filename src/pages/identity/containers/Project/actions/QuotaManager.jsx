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
import globalProjectStore from 'stores/keystone/project';
import React from 'react';
import { ModalAction } from 'containers/Action';
import { VolumeTypeStore } from 'stores/cinder/volume-type';

export class QuotaManager extends ModalAction {
  static id = 'quota-management';

  static title = t('Edit Quota');

  init() {
    this.store = globalProjectStore;
    this.volumeTypeStore = new VolumeTypeStore();
    // this.getQuota();
  }

  get name() {
    return t('Edit quota');
  }

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { id: project_id } = this.item;
    await this.store.fetchProjectQuota({
      project_id,
    });
    await this.volumeTypeStore.fetchProjectVolumeTypes(project_id);
  };

  get tips() {
    return (
      <>
        {t(
          'quota set to -1 means there is no quota limit on the current resource'
        )}
      </>
    );
  }

  static policy = [
    'os_compute_api:os-quota-sets:update',
    'os_compute_api:os-quota-sets:defaults',
  ];

  static allowed = () => Promise.resolve(true);

  get volumeTypesData() {
    const volumeTypes = [];
    const { projectVolumeTypes: data = [] } = this.volumeTypeStore;
    if (data[0] && this.formRef.current) {
      data.forEach((item) => {
        volumeTypes.push.apply(volumeTypes, [
          {
            text: t('{name} type', { name: item.name }),
            key: `volumes_${item.name}`,
          },
          {
            text: t('{name} type gigabytes(GB)', { name: item.name }),
            key: `gigabytes_${item.name}`,
          },
          {
            text: t('{name} type snapshots', { name: item.name }),
            key: `snapshots_${item.name}`,
          },
        ]);
      });
    }

    return volumeTypes;
  }

  get defaultValue() {
    const {
      quota: {
        instances,
        cores,
        security_group,
        ram,
        ipsecpolicy,
        key_pairs,
        security_group_rule,
        router,
        volumes,
        network,
        subnet,
        floatingip,
        vpnservice,
        vpntunnel,
        gigabytes,
        backups,
        port,
        backup_gigabytes,
        endpoint_group,
        loadbalancer,
        snapshots,
        server_groups,
        server_group_members,
      },
    } = this.store;
    if (instances && this.formRef.current) {
      const initData = {
        more: false,
        instances: (instances || {}).limit,
        cores: (cores || {}).limit,
        security_group: (security_group || {}).limit,
        ram: (ram || {}).limit,
        ipsecpolicy: (ipsecpolicy || {}).limit,
        key_pairs: (key_pairs || {}).limit,
        security_group_rule: (security_group_rule || {}).limit,
        router: (router || {}).limit,
        volumes: (volumes || {}).limit,
        network: (network || {}).limit,
        subnet: (subnet || {}).limit,
        floatingip: (floatingip || {}).limit,
        vpnservice: (vpnservice || {}).limit,
        vpntunnel: (vpntunnel || {}).limit,
        port: (port || {}).limit,
        gigabytes: (gigabytes || {}).limit,
        backup_gigabytes: (backup_gigabytes || {}).limit,
        backups: (backups || {}).limit,
        snapshots: (snapshots || {}).limit,
        server_groups: (server_groups || {}).limit,
        server_group_members: (server_group_members || {}).limit,
        endpoint_group: (endpoint_group || {}).limit,
        loadbalancer: (loadbalancer || {}).limit,
      };
      // eslint-disable-next-line no-return-assign
      this.volumeTypesData.forEach((i) => {
        initData[i.key] = this.store.quota[i.key].limit;
      });
      this.formRef.current.setFieldsValue(initData);
    }
    return {};
  }

  // static allowed = item => Promise.resolve(true);

  checkMin = (rule, value) => {
    const { quota } = this.store;
    const { field } = rule;
    const { used } = quota[field];
    const intNum = /^-?\d+$/;
    if ((value < used && value !== -1) || !intNum.test(value)) {
      return Promise.reject(
        t(
          'Invalid: Quota value(s) cannot be less than the current usage value(s): { used } used.',
          { used }
        )
      );
    }
    return Promise.resolve();
  };

  get formItems() {
    const { more } = this.state;
    const form = [
      {
        name: 'nova',
        label: t('Compute'),
        type: 'label',
        labelCol: { span: 12, offset: 6 },
      },
      {
        name: 'instances',
        label: t('instance'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'cores',
        label: t('vCPU'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'ram',
        label: t('RAM(GB)'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'key_pairs',
        label: t('keypair'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'server_groups',
        label: t('Server Group'),
        type: 'input-number',
        labelCol: { span: 6 },
        validator: this.checkMin,
      },
      {
        name: 'server_group_members',
        label: t('Server Group Member'),
        type: 'input-number',
        labelCol: { span: 6 },
        validator: this.checkMin,
      },
      {
        name: 'cinder',
        label: t('Storage'),
        type: 'label',
        labelCol: { span: 12, offset: 6 },
        colNum: 2,
      },
      {
        name: 'networks',
        label: t('Network'),
        type: 'label',
        labelCol: { span: 12, offset: 6 },
        colNum: 2,
      },
      {
        name: 'volumes',
        label: t('Volume'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'router',
        label: t('router'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'gigabytes',
        label: `${t('gigabytes')}(GB)`,
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'network',
        label: t('network'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'backups',
        label: t('Backup'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'subnet',
        label: t('subnet'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'backup_gigabytes',
        label: t('Backup Capacity'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'floatingip',
        label: t('floatingip'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'snapshots',
        label: t('Snapshot'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'port',
        label: t('Port'),
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        validator: this.checkMin,
      },
      {
        name: 'security_group',
        label: t('security_group'),
        type: 'input-number',
        labelCol: { span: 6, offset: 12 },
        validator: this.checkMin,
      },
      {
        name: 'security_group_rule',
        label: t('Security Group Rules'),
        type: 'input-number',
        labelCol: { span: 6, offset: 12 },
        validator: this.checkMin,
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
      {
        name: 'cinder_types',
        label: t('Storage Types'),
        type: 'label',
        labelCol: { span: 21, offset: 3 },
        hidden: !more,
      },
    ];

    this.volumeTypesData.forEach((i) =>
      form.push({
        name: i.key,
        label: i.text,
        type: 'input-number',
        labelCol: { span: 12 },
        colNum: 2,
        hidden: !more,
        validator: this.checkMin,
      })
    );
    return form;
  }

  onSubmit = async (values) => {
    const { id: project_id } = this.item;
    const { more, cinder, networks, cinder_types, nova, security, ...others } =
      values;
    const results = this.store.updateProjectQuota({
      project_id,
      data: others,
    });
    return results;
  };
}

export default inject('rootStore')(observer(QuotaManager));
