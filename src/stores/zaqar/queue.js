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

export class QueueStore extends Base {
  get client() {
    return client.zaqar.queues;
  }

  get needGetProject() {
    return false;
  }

  // Tell the base store that the list lives under the "queues" key in the response.
  get listResponseKey() {
    return 'queues';
  }

  // Add "id" field (same as name) so the base List component can key rows.
  get mapper() {
    return (item) => ({
      ...item,
      id: item.name,
    });
  }

  get paramsFunc() {
    return () => ({});
  }

  @action
  create = (data) =>
    this.submitting(this.client.create(data.name, data.metadata || {}));

  @action
  delete = ({ name }) => this.submitting(this.client.deleteQueue(name));

  @action
  getStats(name) {
    return this.client.getStats(name);
  }

  @action
  getMetadata(name) {
    return this.client.getMetadata(name);
  }

  async listDidFetch(items) {
    if (!items.length) {
      return items;
    }

    const statsList = await Promise.all(
      items.map(async (item) => {
        try {
          const stats = await this.getStats(item.name);
          return {
            ...item,
            stats,
          };
        } catch (e) {
          return item;
        }
      })
    );

    return statsList;
  }

  @action
  setMetadata(name, data) {
    return this.submitting(this.client.setMetadata(name, data));
  }

  @action
  purge = async (name) => {
    // Zaqar limits pop to max 20 per call — loop until queue is empty.
    // eslint-disable-next-line no-await-in-loop
    let deleted = 0;
    do {
      // eslint-disable-next-line no-await-in-loop
      const result = await this.client.purge(name);
      // result may be an array of deleted messages or null
      const count = Array.isArray(result) ? result.length : 0;
      deleted = count;
    } while (deleted > 0);
  };
}

const globalQueueStore = new QueueStore();
export default globalQueueStore;
