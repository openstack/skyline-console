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

export class NeutronStore extends Base {
  @observable
  availableZones = [];

  @observable
  zoneLoading = false;

  get zoneClient() {
    return client.neutron.azones;
  }

  @action
  async fetchAvailableZones() {
    this.zoneLoading = true;
    const resData = await this.zoneClient.list();
    const { availability_zones: items = [] } = resData;
    this.availableZones = items;
    this.zoneLoading = false;
  }
}

const globalNeutronStore = new NeutronStore();
export default globalNeutronStore;
