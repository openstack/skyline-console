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
import globalContainersStore from 'src/stores/zun/containers';
import { checkItemAction } from 'resources/zun/container';

export default class ForceDeleteContainer extends ConfirmAction {
  get id() {
    return 'force-delete';
  }

  get title() {
    return t('Force Delete Container');
  }

  get actionName() {
    return t('Force Delete Container');
  }

  get buttonText() {
    return t('Force Delete');
  }

  get isDanger() {
    return true;
  }

  policy = 'container:delete_force';

  aliasPolicy = 'zun:container:delete_force';

  allowedCheckFunc = (item) => checkItemAction(item, 'delete_force');

  onSubmit = (data) => globalContainersStore.forceDelete({ id: data.uuid });
}
