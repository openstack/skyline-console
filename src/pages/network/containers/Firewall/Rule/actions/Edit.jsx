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
import { isMine } from 'resources/neutron/firewall-rule';
import Create from './Create';

export class EditForm extends Create {
  static id = 'rule-edit';

  static title = t('Edit Rule');

  static buttonText = t('Edit');

  static path = (item) => `/network/firewall-rule/edit/${item.id}`;

  get listUrl() {
    return this.getRoutePath('firewall', null, { tab: 'rules' });
  }

  get name() {
    return t('Edit rule');
  }

  static policy = 'update_firewall_rule';

  static allowed(item) {
    return Promise.resolve(isMine(item));
  }
}

export default inject('rootStore')(observer(EditForm));
