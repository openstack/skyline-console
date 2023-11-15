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
import globalPoolStore from 'stores/octavia/pool';
import globalLbaasStore from 'stores/octavia/loadbalancer';

export default class DeletePoolAction extends ConfirmAction {
  get id() {
    return 'delete';
  }

  get title() {
    return t('Delete Default Pool');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Delete Default Pool');
  }

  get actionName() {
    return t('delete default pool');
  }

  policy = 'os_load-balancer_api:pool:delete';

  allowedCheckFunc = async (item, containerProps) => {
    const { detail } = containerProps || {};
    let lbDetail = item.loadBalancer || detail;
    if (!lbDetail) {
      lbDetail = await globalLbaasStore.pureFetchDetail(item.loadbalancers[0]);
    }
    return Promise.resolve(
      !!item.default_pool_id &&
        item.provisioning_status === 'ACTIVE' &&
        lbDetail.provisioning_status === 'ACTIVE'
    );
  };

  isOwnerOrAdmin() {
    // TODO: check owner
    return true;
  }

  onSubmit = () => globalPoolStore.delete({ id: this.item.default_pool_id });
}
