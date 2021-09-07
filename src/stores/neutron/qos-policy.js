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

import client from 'client';
import Base from 'stores/base';

export class QoSPolicyStore extends Base {
  get client() {
    return client.neutron.qosPolicies;
  }

  get projectClient() {
    return client.keystone.projects;
  }

  get listResponseKey() {
    return 'policies';
  }

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

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  get paramsFuncPage() {
    return (params) => {
      const { current, ...rest } = params;
      return rest;
    };
  }

  async createBandwidthLimitRule({ id }, data) {
    const body = {
      bandwidth_limit_rule: data,
    };
    return this.submitting(this.client.bandwidthLimitRules.create(id, body));
  }

  async createDSCPMarkingRule({ id }, data) {
    const body = {
      dscp_marking_rule: data,
    };
    return this.submitting(this.client.dscpMarkingRules.create(id, body));
  }

  async deleteBandwidthLimitRules({ id }, ruleId) {
    return this.submitting(this.client.bandwidthLimitRules.delete(id, ruleId));
  }

  async deleteDSCPMarkingRules({ id }, ruleId) {
    return this.submitting(this.client.dscpMarkingRules.delete(id, ruleId));
  }

  async updateBandwidthLimitRule({ id }, ruleId, rule) {
    return this.submitting(
      this.client.bandwidthLimitRules.update(id, ruleId, {
        bandwidth_limit_rule: rule,
      })
    );
  }

  async updateDSCPMarkingRule({ id }, ruleId, rule) {
    return this.submitting(
      this.client.dscpMarkingRules.update(id, ruleId, {
        dscp_marking_rule: rule,
      })
    );
  }

  async detailDidFetch(item, all_projects) {
    if (all_projects) {
      item.project_name =
        (await this.projectClient.show(item.project_id)).project.name || '-';
    }
    return item;
  }

  get needGetProject() {
    return true;
  }
}

const globalQoSPolicyStore = new QoSPolicyStore();

export default globalQoSPolicyStore;
