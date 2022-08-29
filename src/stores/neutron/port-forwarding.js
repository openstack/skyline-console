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
import Base from 'stores/base';
import { isEmpty } from 'lodash';

export class PortForwardingStore extends Base {
  get client() {
    return client.neutron.floatingips.portForwardings;
  }

  get isSubResource() {
    return true;
  }

  getFatherResourceId = (params) => (params || {}).fipId;

  get paramsFunc() {
    return (params) => {
      const { fipId, fipInfo, current, ...rest } = params;
      return rest;
    };
  }

  listDidFetch(items, allProjects, filters) {
    if (items.length === 0) {
      return items;
    }
    const { fipInfo = {} } = filters;
    if (isEmpty(fipInfo)) {
      return items;
    }
    const { floating_ip_address } = fipInfo;
    items.forEach((item) => {
      item.fip = fipInfo;
      item.floating_ip_address = floating_ip_address;
    });
    return items;
  }

  @action
  create({ id, data }) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(this.client.create(id, body));
  }

  @action
  edit({ fipId, id }, newObject) {
    const body = {};
    body[this.responseKey] = newObject;
    return this.submitting(this.client.update(fipId, id, body));
  }

  @action
  delete = ({ floatingipId, id }) => {
    return this.submitting(this.client.delete(floatingipId, id));
  };
}

const globalPortForwardingStore = new PortForwardingStore();
export default globalPortForwardingStore;
