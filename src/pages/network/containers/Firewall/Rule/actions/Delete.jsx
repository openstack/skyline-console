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

import { ConfirmAction } from 'containers/Action';
import { isArray } from 'lodash';
import globalFirewallRuleStore from 'stores/neutron/firewall-rule';
import { isMine } from 'resources/neutron/firewall-rule';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Rule');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete rule');
  }

  policy = 'delete_firewall_rule';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.isNotUse(item) && (isMine(item) || this.isAdminPage);
  };

  performErrorMsg = (failedItems) => {
    const item = isArray(failedItems) ? failedItems[0] : failedItems;
    let errorMsg = t('You are not allowed to delete rule "{ name }".', {
      name: item.name,
    });
    if (!this.isNotUse(item)) {
      errorMsg = t('You are not allowed to delete rule "{ name }" in use.', {
        name: item.name,
      });
    }
    return errorMsg;
  };

  isNotUse(item) {
    return item.policies.length === 0;
  }

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalFirewallRuleStore.delete({ id });
  };
}
