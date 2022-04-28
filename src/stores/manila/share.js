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

export class ShareStore extends Base {
  @observable
  zones = [];

  @observable
  zoneOptions = [];

  get client() {
    return client.manila.shares;
  }

  get zoneClient() {
    return client.manila.azones;
  }

  get listWithDetail() {
    return true;
  }

  @action
  async fetchAvailableZones() {
    const { availability_zones: zones = [] } = await this.zoneClient.list();
    this.zones = zones;
    this.zoneOptions = zones.map((it) => {
      return {
        value: it.id,
        label: it.name,
      };
    });
  }
}

const globalShareStore = new ShareStore();
export default globalShareStore;
