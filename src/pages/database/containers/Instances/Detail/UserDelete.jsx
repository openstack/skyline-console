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
import globalInstancesUsersStore from 'stores/trove/instances-user';

export default class UserDelete extends ConfirmAction {
  get id() {
    return 'delete-database-user';
  }

  get title() {
    return t('Delete User');
  }

  get actionName() {
    return t('Delete User');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  allowedCheckFunction = () => true;

  policy = 'instance:extension:user:delete';

  onSubmit = (item) => {
    const { id } = this.containerProps.detail;
    const name = item.name || this.item.name;
    return globalInstancesUsersStore.deleteUser({ id, name });
  };
}
