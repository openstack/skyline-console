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

import Base from '../client/base';
import { cloudkittyBase, cloudkittyEndpoint } from '../client/constants';

// CloudKitty (the OpenStack "rating" service) exposes two API versions:
//  - v1: rating modules, the hashmap module config (services, fields,
//    mappings, thresholds), the pyscripts module config, and the collector
//    metrics.
//  - v2: the rating summary endpoint used by the project dashboard.
// The keystone catalog entry points at the un-versioned base URL, so every
// resource key below is prefixed with its version.
export class CloudKittyClient extends Base {
  get baseUrl() {
    return cloudkittyBase();
  }

  get enable() {
    return !!cloudkittyEndpoint();
  }

  get request() {
    const request = super.request;
    // Like Octavia, CloudKitty v1 uses WSME content negotiation. Axios's
    // default Accept includes */*, which can select XML instead of JSON.
    const jsonConfig = (conf = {}) => ({
      ...conf,
      headers: { ...conf.headers, Accept: 'application/json' },
    });
    return {
      get: async (url, params, conf) => {
        const result = await request.get(url, params, jsonConfig(conf));
        // A successful XML/HTML response must reach the list's error handler,
        // rather than becoming [] when the store looks up its collection key.
        if (typeof result === 'string') {
          throw new Error(
            'CloudKitty returned a non-JSON response; expected application/json.'
          );
        }
        return result;
      },
      post: (url, data, params, conf) =>
        request.post(url, data, params, jsonConfig(conf)),
      put: (url, data, params, conf) =>
        request.put(url, data, params, jsonConfig(conf)),
      delete: (url, data, params, conf) =>
        request.delete(url, data, params, jsonConfig(conf)),
      patch: (url, data, params, conf) =>
        request.patch(url, data, params, jsonConfig(conf)),
      head: (url, params, conf) => request.head(url, params, jsonConfig(conf)),
      copy: (url, params, conf) => request.copy(url, params, jsonConfig(conf)),
    };
  }

  get resources() {
    return [
      // --- Rating modules (enable/disable, priority) ---
      {
        name: 'modules',
        key: 'v1/rating/modules',
        responseKey: 'module',
      },
      // --- Rating summary (v2) ---
      {
        name: 'summary',
        key: 'v2/summary',
        responseKey: 'summary',
      },
      // Reporting remains available with v1 storage, which disables v2.
      {
        name: 'legacySummary',
        key: 'v1/report/summary',
        responseKey: 'summary',
      },
      // --- Collector metrics ---
      // `infoMetrics.list()` -> GET /v1/info/metrics
      {
        name: 'infoMetrics',
        key: 'v1/info/metrics',
        responseKey: 'metric',
      },
      // --- HashMap module config ---
      // `.../hashmap/services` is the services collection. `.../hashmap/types`
      // is a different endpoint that only lists the cost types.
      {
        name: 'hashmapServices',
        key: 'v1/rating/module_config/hashmap/services',
        responseKey: 'service',
      },
      {
        name: 'hashmapFields',
        key: 'v1/rating/module_config/hashmap/fields',
        responseKey: 'field',
      },
      {
        name: 'hashmapMappings',
        key: 'v1/rating/module_config/hashmap/mappings',
        responseKey: 'mapping',
      },
      {
        name: 'hashmapThresholds',
        key: 'v1/rating/module_config/hashmap/thresholds',
        responseKey: 'threshold',
      },
      // --- PyScripts module config ---
      {
        name: 'pyscripts',
        key: 'v1/rating/module_config/pyscripts/scripts',
        responseKey: 'script',
      },
    ];
  }
}

const cloudkittyClient = new CloudKittyClient();
export default cloudkittyClient;
