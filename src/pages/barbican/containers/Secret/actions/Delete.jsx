// Copyright 2025 99cloud
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
import globalSecretsStore from 'stores/barbican/secrets';

export default class DeleteAction extends ConfirmAction {
  static policy = 'secret:delete';

  static allowed = () => Promise.resolve(true);

  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Secret');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete secret');
  }

  onSubmit = (data) => {
    return globalSecretsStore.delete(data);
  };
}
