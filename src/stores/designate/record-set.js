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
import { action } from 'mobx';
import Base from './base';

export class DNSRecordSetsStore extends Base {
  get client() {
    return client.designate.zones.recordsets;
  }

  get isSubResource() {
    return true;
  }

  getFatherResourceId = (params) => params.zoneId || params.id;

  get paramsFuncPage() {
    return (params) => {
      const { id, zoneId, all_projects, current, ...rest } = params;
      return rest;
    };
  }

  @action
  delete = ({ zone_id, recordset_id }) =>
    this.submitting(this.client.delete(zone_id, recordset_id));

  @action
  update = (zone_id, recordset_id, body) =>
    this.submitting(this.client.update(zone_id, recordset_id, body));

  @action
  create = ({ id }, body) => this.submitting(this.client.create(id, body));
}

const globalDNSRecordSetsStore = new DNSRecordSetsStore();
export default globalDNSRecordSetsStore;
