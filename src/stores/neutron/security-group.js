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
import { mapperRule } from 'resources/neutron/security-group-rule';
import client from 'client';
import Base from 'stores/base';
import globalProjectMapStore from 'stores/project';

export class SecurityGroupStore extends Base {
  get client() {
    return client.neutron.securityGroups;
  }

  get listFilterByProject() {
    return true;
  }

  get mapper() {
    return (data) => {
      const { security_group_rules = [] } = data;
      return {
        ...data,
        security_group_rules: security_group_rules.map(mapperRule),
      };
    };
  }

  async detailDidFetch(item) {
    const { project_id } = item;
    const project = await globalProjectMapStore.fetchProjectDetail({
      id: project_id,
    });
    item.project_name = project ? project.name || '-' : '-';
    return item;
  }

  @action
  async updatePortSecurityGroup({ id, reqBody }) {
    return this.submitting(client.neutron.ports.update(id, reqBody));
  }
}

const globalSecurityGroupStore = new SecurityGroupStore();
export default globalSecurityGroupStore;
