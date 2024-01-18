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
import { isArray } from 'lodash';
import globalSnapshotStore from 'stores/cinder/snapshot';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Volume Snapshot');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete volume snapshot');
  }

  policy = 'volume:delete_snapshot';

  allowedCheckFunc = (data) => !this.hasCreatedVolumes(data);

  hasCreatedVolumes = (data) =>
    data.child_volumes && data.child_volumes.length > 0;

  performErrorMsg = (failedItems) => {
    const snapshot = isArray(failedItems) ? failedItems[0] : failedItems;
    const { child_volumes = [] } = snapshot;
    let errorMsg = t('You are not allowed to delete snapshot "{ name }".', {
      name: snapshot.name,
    });
    if (this.hasCreatedVolumes(snapshot)) {
      const volumeNames = child_volumes.map((it) => it.volume_name).join(', ');
      errorMsg = t(
        'You are not allowed to delete snapshot "{ name }", which is used by creating volume "{volumes}".',
        { name: snapshot.name, volumes: volumeNames }
      );
    }
    return errorMsg;
  };

  onSubmit = (data) => globalSnapshotStore.delete({ id: data.id });
}
