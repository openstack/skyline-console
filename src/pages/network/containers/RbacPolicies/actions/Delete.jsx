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
import globalRbacPoliciesStore from 'stores/neutron/rbac-policies';

export default class Delete extends ConfirmAction {
  policy = 'delete_rbac_policy';

  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete RBAC Policy');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get messageHasItemName() {
    return false;
  }

  get actionName() {
    return t('delete');
  }

  onSubmit = (data) => globalRbacPoliciesStore.delete(data);
}
