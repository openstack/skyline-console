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

// HashMap fields belong to a service and are listed with ?service_id=.
// `filterByApi` is required so that param reaches the API instead of being
// dropped by the base store's reserved-param whitelist.
export class CloudKittyHashMapFieldStore extends Base {
  get client() {
    return client.cloudkitty.hashmapFields;
  }

  get filterByApi() {
    return true;
  }

  get mapper() {
    return (item) => ({
      ...item,
      id: item.field_id,
    });
  }

  @action
  async create(data) {
    return this.submitting(this.client.create(data));
  }
}

const globalCloudKittyHashMapFieldStore = new CloudKittyHashMapFieldStore();
export default globalCloudKittyHashMapFieldStore;
