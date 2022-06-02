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
import globalRouterStore from 'stores/neutron/router';

export default class DeleteAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Router');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete');
  }

  get actionName() {
    return t('delete router');
  }

  policy = 'delete_router';

  submitErrorMsg = (data) => {
    const name = this.getName(data);
    if (this.connectSubnets) {
      return t('Unable to {action}, because : {reason}, instance: {name}.', {
        action: this.actionName || this.title,
        name,
        reason: t('the router has connected subnet'),
      });
    }
    return t('Unable to {action}, instance: {name}.', {
      action: this.actionName || this.title,
      name,
    });
  };

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    return this.notExternalGateway(item);
  };

  performErrorMsg = (failedItems) => {
    const item = isArray(failedItems) ? failedItems[0] : failedItems;
    const { name } = item;
    let errorMsg = t('You are not allowed to delete router "{ name }".', {
      name,
    });
    if (!this.notExternalGateway(item)) {
      errorMsg = t(
        'Unable to delete router "{ name }". External gateway is opened, please clear external gateway first.',
        { name }
      );
    }
    return errorMsg;
  };

  notAssociatedNet(router) {
    if (!router.ports || router.ports.length === 0) {
      return true;
    }
    const deviceOwnerList = [
      'network:router_interface_distributed',
      'network:router_interface',
      'network:ha_router_replicated_interface',
    ];
    if (router.ports.length > 0) {
      const associated = router.ports.some(
        (port) => deviceOwnerList.indexOf(port.device_owner) > -1
      );
      return !associated;
    }
    return true;
  }

  notExternalGateway(item) {
    return !item.hasExternalGateway;
  }

  onSubmit = async (data, containerProps, isBatch) => {
    if (isBatch) {
      return globalRouterStore.delete(data);
    }
    const item = await globalRouterStore.fetchConnectedSubnets(this.item);
    if (item.connectSubnets.length) {
      this.connectSubnets = item.connectSubnets;
      this.showConfirmErrorBeforeSubmit = true;
      this.confirmErrorMessageBeforeSubmit = t(
        'Unable to {action}, because : {reason}, instance: {name}.',
        {
          action: this.actionName || this.title,
          name: this.item.name,
          reason: t('the router has connected subnet'),
        }
      );
      return Promise.reject();
    }
    this.showConfirmErrorBeforeSubmit = false;
    return globalRouterStore.delete(data);
  };
}
