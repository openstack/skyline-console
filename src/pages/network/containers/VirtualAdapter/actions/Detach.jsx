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
import globalServerStore, { ServerStore } from 'stores/nova/instance';
// import { isActiveOrShutOff, isNotLocked } from 'resources/instance';

export default class Detach extends ConfirmAction {
  get id() {
    return 'detach_instance';
  }

  get title() {
    return t('Detach Instance');
  }

  get buttonText() {
    return t('Detach');
  }

  get actionName() {
    return t('detach instance');
  }

  get isAsyncAction() {
    return true;
  }

  policy = 'os_compute_api:os-attach-interfaces:delete';

  getNameOne = (data) => data.name || data.id;

  hasMoreInterfaces(instance) {
    let count = 0;
    const { addresses } = instance;
    Object.keys(addresses).forEach((key) => {
      const detail = addresses[key];
      count += detail.length;
    });
    return count > 1;
  }

  allowedCheckFunc = (item) => {
    const flag = !!item.device_id;
    const { detail } = this.containerProps;
    if (detail) {
      return flag && this.hasMoreInterfaces(detail);
    }
    // && item.instance
    // && isNotLocked(item.instance) && isActiveOrShutOff(item.instance)
    // && this.hasMoreInterfaces(item.instance);
    // console.log(flag, item);
    return flag;
  };

  onSubmit = async () => {
    const { id, device_id } = this.item;
    const { detail } = this.containerProps;
    if (!detail) {
      const store = new ServerStore();
      await store.fetchDetail({ id: device_id });
      if (!this.hasMoreInterfaces(store.detail)) {
        this.onlyOne = true;
        this.showConfirmErrorBeforeSubmit = true;
        this.confirmErrorMessageBeforeSubmit = t(
          'Unable to {action}, because : {reason}, instance: {name}.',
          {
            action: this.actionName || this.title,
            name: this.item.name,
            reason: t('the instance only has one virtual adapter'),
          }
        );
        return Promise.reject();
      }
    }
    this.showConfirmErrorBeforeSubmit = false;
    return globalServerStore.detachInterface({ id: device_id, ports: [id] });
  };
}
