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

import { action, observable } from 'mobx';
import client from 'client';
import Base from 'stores/base';

export class SkylineStore extends Base {
  @observable
  domains = [];

  @observable
  regions = [];

  @observable
  sso = {};

  @observable
  userDefaultDomain = '';

  get client() {
    return client.skyline.contrib;
  }

  @action
  async fetchDomainList() {
    const result = await this.client.domains();
    this.domains = result;
  }

  @action
  async fetchRegionList() {
    const result = await this.client.regions();
    this.regions = result;
  }

  @action
  async fetchSSO() {
    const result = await client.skyline.sso.list();
    this.sso = result;
  }

  @action
  async fetchUserDefaultDomain() {
    try {
      const result = await client.skyline.config.getUserDefaultDomain();
      this.userDefaultDomain = result.default_domain;
    } catch (e) {
      console.error('Failed to fetch user_default_domain:', e);
    }
  }
}

const globalSkylineStore = new SkylineStore();
export default globalSkylineStore;
