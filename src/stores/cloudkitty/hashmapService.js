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
import { get } from 'lodash';
import client from 'client';
import Base from 'stores/base';

// HashMap services are the top level of the hashmap module config:
// /v1/rating/module_config/hashmap/services, which returns { services: [...] }.
// Each service can own fields, mappings and thresholds, all of which are
// listed with ?service_id=<service_id>.
export class CloudKittyHashMapServiceStore extends Base {
  // Metrics configured on CloudKitty's collector (GET /v1/info/metrics), used
  // to populate the "Service" choice in the create form.
  @observable
  metrics = [];

  get client() {
    return client.cloudkitty.hashmapServices;
  }

  get metricsClient() {
    return client.cloudkitty.infoMetrics;
  }

  // GET /v1/info/metrics -> { metrics: [ { metric_id, metadata, unit }, ... ] }
  // (CloudkittyMetricInfoCollection). The collector metric ids are the valid
  // service names. The API returns HTTP 405 when no metrics are configured,
  // which is caught below so the form can fall back to the custom-service
  // input.
  @action
  async fetchMetrics() {
    this.isLoading = true;
    try {
      const result = await this.metricsClient.list();
      const metrics = get(result, 'metrics', []);
      // Normally a list of metric-info objects; also accept a keyed object.
      const names = Array.isArray(metrics)
        ? metrics.map((m) => m.metric_id || m.name).filter(Boolean)
        : Object.keys(metrics);
      this.metrics = names.sort();
    } catch (e) {
      // Non-fatal: no metrics configured (405) or endpoint unavailable. The
      // form falls back to the custom-service free-text input.
      this.metrics = [];
    } finally {
      this.isLoading = false;
    }
    return this.metrics;
  }

  // No `filterByApi` here: the services endpoint takes no filter params, so
  // the Name search is applied client-side by the list container.

  get mapper() {
    return (item) => ({
      ...item,
      id: item.service_id,
    });
  }

  @action
  async fetchDetail({ id }) {
    this.isLoading = true;
    const result = await this.client.show(id);
    const item = get(result, this.responseKey, result);
    this.detail = { ...item, id: item.service_id };
    this.isLoading = false;
    return this.detail;
  }

  @action
  async create(data) {
    return this.submitting(this.client.create(data));
  }
}

const globalCloudKittyHashMapServiceStore = new CloudKittyHashMapServiceStore();
export default globalCloudKittyHashMapServiceStore;
