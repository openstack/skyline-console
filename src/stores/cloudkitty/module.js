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
import { get } from 'lodash';
import client from 'client';
import Base from 'stores/base';

// Rating modules: GET /v1/rating/modules returns { modules: [...] }.
// Each module: { module_id, description, enabled, priority, hot-config }.
// Enable/disable and priority changes are PUT /v1/rating/modules/{module_id}.
export class CloudKittyModuleStore extends Base {
  get client() {
    return client.cloudkitty.modules;
  }

  get listResponseKey() {
    return 'modules';
  }

  get mapper() {
    return (item) => ({
      ...item,
      id: item.module_id,
      name: item.module_id,
      hotConfig: item['hot-config'],
    });
  }

  @action
  async toggle({ id }, enabled) {
    return this.submitting(this.client.update(id, { module_id: id, enabled }));
  }

  @action
  async updatePriority({ id }, priority) {
    return this.submitting(this.client.update(id, { module_id: id, priority }));
  }

  @action
  async fetchDetail({ id }) {
    this.isLoading = true;
    const result = await this.client.show(id);
    const item = get(result, this.responseKey, result);
    this.detail = this.mapper(item);
    this.isLoading = false;
    return this.detail;
  }
}

const globalCloudKittyModuleStore = new CloudKittyModuleStore();
export default globalCloudKittyModuleStore;
