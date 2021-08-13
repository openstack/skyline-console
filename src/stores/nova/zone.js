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
import { isEmpty, isNull } from 'lodash';
import client from 'client';
import Base from 'stores/base';

export class AvailabilityZoneStore extends Base {
  get client() {
    return client.nova.zone;
  }

  get listResponseKey() {
    return this.responseKey;
  }

  get listWithDetail() {
    return true;
  }

  get mapper() {
    return (data) => {
      const { available } = data.zoneState;
      data.available = available;
      return data;
    };
  }

  async listDidFetch(items) {
    const data = [];
    items.forEach((item) => {
      const { hosts } = item;
      if (isNull(hosts)) {
        data.push(item);
      } else {
        const newHost = {};
        Object.keys(hosts).forEach((key) => {
          const value = hosts[key];
          if (value['nova-compute']) {
            newHost[key] = value;
          }
        });
        if (!isEmpty(newHost)) {
          data.push({
            ...item,
            host: newHost,
          });
        }
      }
    });
    return data;
  }

  @action
  async fetchListWithoutDetail() {
    const result = await this.client.list();
    const data = result[this.listResponseKey];
    this.list.data = data.map(this.mapper);
  }
}

const globalAvailabilityZoneStore = new AvailabilityZoneStore();
export default globalAvailabilityZoneStore;
