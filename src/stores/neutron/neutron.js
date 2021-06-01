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

import { neutronBase } from 'utils/constants';
import { action, observable } from 'mobx';
import Base from '../base';

export class NeutronStore extends Base {
  @observable
  availableZones = [];

  get apiVersion() {
    return neutronBase();
  }

  @action
  async fetchAvailableZones() {
    const url = `${this.apiVersion}/availability_zones`;
    const resData = await request.get(url);
    const { availability_zones: items = [] } = resData;
    this.availableZones = items;
  }
}

const globalNeutronStore = new NeutronStore();
export default globalNeutronStore;
