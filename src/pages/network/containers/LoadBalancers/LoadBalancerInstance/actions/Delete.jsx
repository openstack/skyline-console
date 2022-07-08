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
import globalLbaasStore from 'stores/octavia/loadbalancer';
import globalRootStore from 'stores/root';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Load Balancer');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete load balancer');
  }

  policy = 'os_load-balancer_api:loadbalancer:delete';

  confirmContext = (data) => {
    const name = this.getName(data);
    return (
      t('Are you sure to {action} (instance: {name})?', {
        action: this.actionNameDisplay || this.title,
        name,
      }) + t('This will delete all child objects of the load balancer.')
    );
  };

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return (
      (this.isCurrentProject(item) && item.provisioning_status === 'ACTIVE') ||
      item.provisioning_status === 'ERROR'
    );
  };

  isCurrentProject(item) {
    const rootStore = globalRootStore;
    if (!checkSystemAdmin() && item.project_id !== rootStore.user.project.id) {
      return false;
    }
    return true;
  }

  onSubmit = (data) => globalLbaasStore.delete(data);
}
