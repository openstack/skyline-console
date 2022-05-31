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
import globalFlavorStore from 'stores/nova/flavor';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Flavor');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete flavor');
  }

  policy = 'os_compute_api:os-flavor-manage:delete';

  confirmContext = (data) => {
    const name = this.getName(data);
    return t(
      "If an instance is using this flavor, deleting it will cause the instance's flavor data to be missing. Are you sure to delete {name}?",
      { name }
    );
  };

  onSubmit = (item) => {
    const { id } = item;
    return globalFlavorStore.delete({ id });
  };
}
