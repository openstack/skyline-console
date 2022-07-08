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
import { checkSystemAdmin } from 'resources/skyline/policy';
import globalVpnIKEPolicyStore from 'stores/neutron/vpn-ike-policy';
import globalVpnIPsecConnectionStore from 'stores/neutron/vpn-ipsec-connection';
import globalRootStore from 'stores/root';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete-vpn-ike-policy';
  }

  get title() {
    return t('Delete VPN IKE Policy');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete vpn IKE policy');
  }

  policy = 'delete_ikepolicy';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.isCurrentProject(item);
  };

  isCurrentProject(item) {
    const rootStore = globalRootStore;
    if (!checkSystemAdmin() && item.project_id !== rootStore.user.project.id) {
      return false;
    }
    return true;
  }

  onSubmit = async (data) => {
    const connections = await globalVpnIPsecConnectionStore.fetchList({
      ikepolicy_id: data.id,
    });
    if (connections.length > 0) {
      this.showConfirmErrorBeforeSubmit = true;
      this.confirmErrorMessageBeforeSubmit = `${t(
        'Unable to {action}, because : {reason}, instance: {name}.',
        {
          action: this.actionName || this.title,
          name: data.name,
          reason: t('the policy is in use'),
        }
      )}\n
        ${t('Used by tunnel(s): {names}. ID(s): {ids}', {
          names: connections.map((i) => i.name).join(', '),
          ids: connections.map((i) => i.id).join(', '),
        })}`;
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject({ errorMsg: this.confirmErrorMessageBeforeSubmit });
    }
    return globalVpnIKEPolicyStore.delete(data);
  };
}
