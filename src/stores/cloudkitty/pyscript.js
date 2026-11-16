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

// PyScripts module config: GET /v1/rating/module_config/pyscripts/scripts
// returns { scripts: [{ script_id, name, checksum, data }] }.
export class CloudKittyPyScriptStore extends Base {
  get client() {
    return client.cloudkitty.pyscripts;
  }

  get listResponseKey() {
    return 'scripts';
  }

  get mapper() {
    return (item) => ({
      ...item,
      id: item.script_id,
    });
  }

  @action
  async fetchDetail({ id }) {
    this.isLoading = true;
    const result = await this.client.show(id);
    const item = get(result, 'script', result);
    this.detail = { ...item, id: item.script_id };
    this.isLoading = false;
    return this.detail;
  }

  @action
  async create(data) {
    return this.submitting(this.client.create(data));
  }

  @action
  async update({ id }, data) {
    return this.submitting(this.client.update(id, data));
  }
}

const globalCloudKittyPyScriptStore = new CloudKittyPyScriptStore();
export default globalCloudKittyPyScriptStore;
