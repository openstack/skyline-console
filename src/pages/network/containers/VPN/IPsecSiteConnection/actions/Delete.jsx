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
import globalVpnIPsecConnectionStore from 'stores/neutron/vpn-ipsec-connection';
import globalRootStore from 'stores/root';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete-ipsec-site-connection';
  }

  get title() {
    return t('Delete IPsec Site Connection');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete ipsec site connection');
  }

  policy = 'delete_ipsec_site_connection';

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

  onSubmit = (data) => globalVpnIPsecConnectionStore.delete(data);
}
