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
import globalProjectStore, { ProjectStore } from 'stores/keystone/project';
import React from 'react';
import { ModalAction } from 'containers/Action';
import { VolumeTypeStore } from 'stores/cinder/volume-type';
import {
  quotaCardList,
  getVolumeTypeCards,
  shareQuotaCard,
  zunQuotaCard,
} from 'pages/base/containers/Overview/components/QuotaOverview';

export class ManageQuota extends ModalAction {
  static id = 'quota-management';

  static title = t('Edit Quota');

  init() {
    this.store = globalProjectStore;
    this.projectStore = new ProjectStore();
    this.volumeTypeStore = new VolumeTypeStore();
    this.getData();
  }

  get name() {
    return t('Edit quota');
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  get enableShare() {
    return this.props.rootStore.checkEndpoint('manilav2');
  }

  get enableZun() {
    return this.props.rootStore.checkEndpoint('zun');
  }

  async getData() {
    const { id: project_id } = this.item;
    const promiseArr = [
      this.projectStore.fetchProjectQuota({
        project_id,
      }),
    ];
    if (this.enableCinder) {
      promiseArr.push(this.volumeTypeStore.fetchProjectVolumeTypes(project_id));
    }
    await Promise.all(promiseArr);
    this.updateDefaultValue();
  }

  get tips() {
    return t(
      'quota set to -1 means there is no quota limit on the current resource'
    );
  }

  static policy = [
    'os_compute_api:os-quota-sets:update',
    'os_compute_api:os-quota-sets:defaults',
  ];

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    const { quota = {} } = this.projectStore;
    const initData = {};
    Object.keys(quota).forEach((key) => {
      const item = this.formItems.find((it) => it.name === key);
      if (item) {
        const { limit } = quota[key] || {};
        initData[key] = limit;
      }
    });
    return initData;
  }

  checkMin = (rule, value) => {
    const { quota } = this.projectStore;
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

  getTitleLabel = (name, title, hidden) => {
    const content = (
      <div style={{ textAlign: 'center', fontWeight: 'bolder' }}>{title}</div>
    );
    return {
      name,
      label: '',
      type: 'label',
      content,
      wrapperCol: { span: 24 },
      hidden,
    };
  };

  getInputItem(name, label, hidden) {
    return {
      name,
      label,
      type: 'input-number',
      labelCol: { span: 12 },
      colNum: 2,
      validator: this.checkMin,
      hidden,
    };
  }

  get quotaCardList() {
    const newQuotaCardList = [...quotaCardList];
    if (this.enableShare) {
      newQuotaCardList.push(shareQuotaCard);
    }
    if (this.enableZun) {
      newQuotaCardList.push(zunQuotaCard);
    }
    return newQuotaCardList;
  }

  getFormItemsByCards(cardType) {
    const card = this.quotaCardList.find((it) => it.type === cardType);
    if (!card) {
      return [];
    }
    const { type, text, value } = card;
    const labelItem = this.getTitleLabel(type, text);
    const items = value.map((it) => {
      const { key, text: vText } = it;
      return this.getInputItem(key, vText);
    });
    return [labelItem, ...items];
  }

  getComputeFormItems() {
    const formItems = this.getFormItemsByCards('compute');
    const memberItem = this.getInputItem(
      'server_group_members',
      t('Server Group Member')
    );
    return [...formItems, memberItem];
  }

  get volumeTypeData() {
    const { projectVolumeTypes: data = [] } = this.volumeTypeStore;
    return data;
  }

  getVolumeTypeFormItems() {
    const { more } = this.state;
    const card = getVolumeTypeCards(this.volumeTypeData);
    const { type, text, value } = card;
    const newValue = [];
    value.forEach((it) => newValue.push(...it.value));
    const labelItem = this.getTitleLabel(type, text, !more);
    const items = newValue.map((it) =>
      this.getInputItem(it.key, it.text, !more)
    );
    return [labelItem, ...items];
  }

  get formItems() {
    const computeFormItems = this.getComputeFormItems();
    const networkFormItems = this.getFormItemsByCards('networks');
    const form = [...computeFormItems, ...networkFormItems];
    if (this.enableShare) {
      form.push(...this.getFormItemsByCards('share'));
    }
    if (this.enableZun) {
      form.push(...this.getFormItemsByCards('zun'));
    }
    if (this.enableCinder) {
      const cinderFormItems = this.getFormItemsByCards('storage');
      const volumeTypeFormItems = this.getVolumeTypeFormItems();
      form.push(...cinderFormItems);
      form.push(
        {
          name: 'more',
          label: t('Advanced Options'),
          type: 'more',
        },
        ...volumeTypeFormItems
      );
    }
    return form;
  }

  getSubmitData(values) {
    const { id: project_id } = this.item;
    const {
      more,
      compute,
      storage,
      networks,
      volumeTypes,
      share,
      zun,
      ...others
    } = values;
    return {
      project_id,
      data: others,
    };
  }

  onSubmit = async (body) => {
    const results = this.store.updateProjectQuota(body);
    return results;
  };
}

export default inject('rootStore')(observer(ManageQuota));
