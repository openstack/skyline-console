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
import globalServerGroupStore from 'stores/nova/server-group';
import { ModalAction } from 'containers/Action';
import policyType from 'resources/nova/server-group';
import globalProjectStore from 'src/stores/keystone/project';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Server Group');

  init() {
    this.state.quota = {};
    this.state.quotaLoading = true;
    this.store = globalServerGroupStore;
    this.projectStore = globalProjectStore;
    this.getQuota();
  }

  get name() {
    return t('Create server group');
  }

  static policy = 'os_compute_api:os-server-groups:create';

  static allowed = () => Promise.resolve(true);

  static get disableSubmit() {
    const { novaQuota: { server_groups: { left = 0 } = {} } = {} } =
      globalProjectStore;
    return left === 0;
  }

  static get showQuota() {
    return true;
  }

  get showQuota() {
    return true;
  }

  async getQuota() {
    const result = await this.projectStore.fetchProjectNovaQuota();
    const { server_groups: quota = {} } = result || {};
    this.setState({
      quota,
      quotaLoading: false,
    });
  }

  get quotaInfo() {
    const { quota = {}, quotaLoading } = this.state;
    if (quotaLoading) {
      return [];
    }
    const { left = 0 } = quota;
    const add = left === 0 ? 0 : 1;
    const data = {
      ...quota,
      add,
      name: 'server_groups',
      title: t('Server Group'),
    };
    return [data];
  }

  get formItems() {
    const policies = Object.keys(policyType).map((it) => ({
      value: it,
      label: policyType[it],
    }));

    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        name: 'policy',
        label: t('Policy'),
        type: 'select',
        placeholder: t('Please select policy'),
        options: policies,
        required: true,
        tip: (
          <div>
            <p>{t('Affinity (mandatory):')}</p>
            <p>
              {t(
                'The instances in the affinity group are strictly allocated to the same physical machine. When there are no more physical machines to allocate, the allocation fails.'
              )}
            </p>
            <p>{t('Anti-affinity (mandatory):')}</p>
            <p>
              {t(
                'The instances in the anti-affinity group are strictly allocated to different physical machines. When there are no more physical machines to allocate, the allocation fails.'
              )}
            </p>
            <p>{t('Affinity (not mandatory):')}</p>
            <p>
              {t(
                'The instances in the affinity group are allocated to the same physical machine as much as possible, and when there are no more physical machines to allocate, the normal allocation strategy is returned.'
              )}
            </p>
            <p>{t('Anti-affinity (not mandatory):')}</p>
            <p>
              {t(
                'The instances in the anti-affinity group are allocated to different physical machines as much as possible. When there are no more physical machines to allocate, the normal allocation strategy is returned.'
              )}
            </p>
          </div>
        ),
      },
    ];
  }

  onSubmit = (values) => globalServerGroupStore.create(values);
}

export default inject('rootStore')(observer(Create));
