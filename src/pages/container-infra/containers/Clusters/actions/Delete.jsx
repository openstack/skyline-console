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
import globalClustersStore from 'stores/magnum/clusters';

export default class DeleteClusters extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Cluster');
  }

  get actionName() {
    return t('Delete Cluster');
  }

  get buttonText() {
    return t('Delete');
  }

  get isDanger() {
    return true;
  }

  policy = 'cluster:delete';

  allowedCheckFunc = (item) => {
    const { stack_id, status } = item;
    const disableDelete =
      status === 'DELETE_IN_PROGRESS' ||
      (status === 'CREATE_IN_PROGRESS' && !stack_id);

    return !disableDelete;
  };

  onSubmit = (data) => globalClustersStore.delete({ id: data.id });
}
