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
import globalHostStore from 'src/stores/masakari/hosts';

export default class Delete extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete');
  }

  get actionName() {
    return t('delete host');
  }

  get isDanger() {
    return true;
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'instance:delete';

  allowedCheckFunction = () => true;

  confirmContext = (data) => {
    const name = this.getName(data);
    return t('Are you sure to {action} (Host: {name})?', {
      action: this.actionNameDisplay || this.title,
      name,
    });
  };

  onSubmit = (item) => {
    const { uuid, failover_segment_id } = item || this.item;
    return globalHostStore.delete({
      segment_id: failover_segment_id,
      host_id: uuid,
    });
  };
}
