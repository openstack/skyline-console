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
import { neutronBase } from 'utils/constants';
import Base from '../base';

export class NeutronAgentNetworkStore extends Base {
  get module() {
    return 'networks';
  }

  get apiVersion() {
    return neutronBase();
  }

  get responseKey() {
    return 'network';
  }

  get listFilterByProject() {
    return true;
  }

  getListUrl = ({ agentId }) =>
    `${this.apiVersion}/agents/${agentId}/dhcp-networks`;

  getDetailUrl = ({ agentId, id }) => `${this.getListUrl({ agentId })}/${id}`;

  async listDidFetch(items, allProjects, filters) {
    const { agentId } = filters;
    return items.map((it) => ({
      ...it,
      agentId,
    }));
  }

  @action
  remove = ({ agentId, id }) =>
    this.submitting(request.delete(this.getDetailUrl({ agentId, id })));

  @action
  add = ({ agentId }, body) =>
    this.submitting(request.post(this.getListUrl({ agentId }), body));
}

const globalNeutronAgentNetworkStore = new NeutronAgentNetworkStore();
export default globalNeutronAgentNetworkStore;
