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
import globalComputeHostStore from 'stores/nova/compute-host';

export default class EnableAction extends ConfirmAction {
  get id() {
    return 'enable-service';
  }

  get title() {
    return t('Enable Compute Service');
  }

  get buttonText() {
    return t('Enable');
  }

  getItemName = (data) => data.host;

  get actionName() {
    return t('enable compute service');
  }

  policy = 'os_compute_api:os-services:update';

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return item.status === 'disabled';
  };

  onSubmit = () => {
    const { id } = this.item;
    return globalComputeHostStore.enable({ id });
  };
}
