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
import globalDNSRecordSetsStore from 'stores/designate/record-set';

export default class Delete extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Record Set');
  }

  get actionName() {
    return t('Delete Record Set');
  }

  get buttonText() {
    return t('Delete');
  }

  get isDanger() {
    return true;
  }

  allowedCheckFunction = () => true;

  policy = 'delete_recordset';

  confirmContext = (data) => {
    const name = this.getName(data);
    const id = this.getItemId(data);
    return t('Are you sure to {action}? (Record Set: {name} - {id})', {
      action: this.actionNameDisplay || this.title,
      name,
      id,
    });
  };

  onSubmit = (item) => {
    const { zone_id } = item;
    const recordset_id = item.id;
    return globalDNSRecordSetsStore.delete({ zone_id, recordset_id });
  };
}
