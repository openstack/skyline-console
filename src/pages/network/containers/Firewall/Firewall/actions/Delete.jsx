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
import globalFirewallStore from 'stores/neutron/firewall';
import { isDefault, isMine, hasNoProject } from 'resources/neutron/firewall';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Firewall');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete firewall');
  }

  policy = 'delete_firewall_group';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    if (this.isAdminPage && hasNoProject(item)) {
      return true;
    }
    return (
      !isDefault(item) &&
      this.isNotActive(item) &&
      (isMine(item) || this.isAdminPage)
    );
  };

  isNotActive = (item) => item.status !== 'ACTIVE';

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalFirewallStore.delete({ id });
  };
}
