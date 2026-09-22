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

import { action } from 'mobx';
import client from 'client';
import Base from 'stores/base';

export class SubscriptionStore extends Base {
  get client() {
    return client.zaqar.queues.subscriptions;
  }

  get needGetProject() {
    return false;
  }

  get listResponseKey() {
    return 'subscriptions';
  }

  get paramsFunc() {
    return () => ({});
  }

  listFetchByClient(params, originParams) {
    const queueName =
      (originParams && originParams.queueName) ||
      (originParams && originParams.id);
    return this.client.list(queueName, params);
  }

  getFatherResourceId = (params) =>
    (params && params.queueName) || (params && params.id);

  @action
  create = (queueName, subscriber, ttl = 3600) =>
    this.submitting(this.client.create(queueName, { subscriber, ttl }));

  @action
  update = ({ id, queueName }, data) =>
    this.submitting(this.client.patch(queueName, id, data));

  @action
  delete = ({ id, queueName }) =>
    this.submitting(this.client.delete(queueName, id));
}

const globalSubscriptionStore = new SubscriptionStore();
export default globalSubscriptionStore;
