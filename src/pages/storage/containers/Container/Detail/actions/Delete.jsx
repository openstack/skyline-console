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
import globalObjectStore, { ObjectStore } from 'stores/swift/object';
import { allCanChangePolicy } from 'resources/skyline/policy';
import { isFile } from 'resources/swift/container';

export default class Delete extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get isFile() {
    if (!this.item) {
      return true;
    }
    return isFile(this.item);
  }

  get title() {
    return this.isFile ? t('Delete File') : t('Delete Folder');
  }

  get name() {
    return this.title;
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return this.title;
  }

  getItemName = (item) => item.shortName;

  policy = allCanChangePolicy;

  onSubmit = async (data) => {
    if (isFile(data)) {
      this.showConfirmErrorBeforeSubmit = false;
      return globalObjectStore.delete(data);
    }
    const store = new ObjectStore();
    const { container, name } = data;
    const records = await store.fetchList({ container, path: name });
    if (records.length > 0) {
      this.showConfirmErrorBeforeSubmit = true;
      this.confirmErrorMessageBeforeSubmit = t(
        'Unable to {action}, because : {reason}, instance: {name}.',
        {
          action: this.actionName || this.title,
          name: this.item.name,
          reason: t('the folder is not empty'),
        }
      );
      return Promise.reject();
    }
    this.showConfirmErrorBeforeSubmit = false;
    return globalObjectStore.delete(data);
  };
}
