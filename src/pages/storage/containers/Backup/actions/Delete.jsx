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
import globalBackupStore from 'stores/cinder/backup';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Volume Backup');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete volume backup');
  }

  policy = 'backup:delete';

  aliasPolicy = 'cinder:backup:delete';

  get isAsyncAction() {
    return true;
  }

  allowedCheckFunc = () => true;

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalBackupStore.delete({ id });
  };
}
