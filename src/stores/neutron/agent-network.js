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
import { isArray } from 'lodash';
import Base from 'stores/base';

export class NeutronAgentNetworkStore extends Base {
  get client() {
    return client.neutron.agents.dhcpNetworks;
  }

  get isSubResource() {
    return true;
  }

  getFatherResourceId = (params) => params.agentId;

  get listFilterByProject() {
    return true;
  }

  get mapper() {
    return (data) => {
      const { created_at } = data;
      return {
        ...data,
        standard_attr_id: created_at,
      };
    };
  }

  async listDidFetch(items, allProjects, filters) {
    const { agentId } = filters;
    return items.map((it) => ({
      ...it,
      agentId,
    }));
  }

  @action
  remove = ({ agentId, id }) =>
    this.submitting(this.client.delete(agentId, id));

  @action
  add = ({ agentId }, body) => {
    if (!isArray(body)) {
      return this.submitting(this.client.create(agentId, body));
    }
    const reqs = body.map((it) => this.client.create(agentId, it));
    return this.submitting(Promise.allSettled(reqs));
  };
}

const globalNeutronAgentNetworkStore = new NeutronAgentNetworkStore();
export default globalNeutronAgentNetworkStore;
