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
import { tableColumns } from 'resources/neutron/firewall-rule';
import Base from 'containers/BaseDetail';

export class BaseDetail extends Base {
  get leftCards() {
    return [this.baseInfoCard];
  }

  get baseInfoCard() {
    const columns = tableColumns.slice(3, tableColumns.length).map((it) => ({
      ...it,
      label: it.title,
    }));
    const policy = {
      label: t('Related Policy'),
      dataIndex: 'policies',
      render: (value) =>
        (value || []).map((it) => (
          <div key={it.id}>
            {this.getLinkRender('firewallPolicyDetail', it.name, { id: it.id })}
          </div>
        )),
    };
    const options = [policy, ...columns];
    return {
      title: t('Base Info'),
      options,
    };
  }
}

export default inject('rootStore')(observer(BaseDetail));
