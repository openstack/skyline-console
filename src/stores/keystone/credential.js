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

import { action } from 'mobx';
import client from 'client';
import globalRootStore from 'stores/root';
import globalUserStore from 'stores/keystone/user';
import Base from 'stores/base';

export class CredentialStore extends Base {
  get isSubResource() {
    return true;
  }

  get client() {
    return client.keystone.users.applicationCredentials;
  }

  get paramsFunc() {
    return (params) => {
      const { current, id, all_projects, ...rest } = params;
      return rest;
    };
  }

  @action
  create(data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(
      this.client.create(globalRootStore.user.user.id, body)
    );
  }

  async listDidFetch(items, allProjects) {
    if (!allProjects) {
      try {
        const results = await globalUserStore.getUserProjects();
        const projectNameMap = new Map();
        results.forEach((p) => {
          projectNameMap.set(p.id, p.name);
        });
        items.forEach((item) => {
          item.project_name = projectNameMap.get(item.project_id) || '-';
        });
      } catch (e) {
        return items;
      }
    }
    return items;
  }
}

const globalCredentialStore = new CredentialStore();
export default globalCredentialStore;
