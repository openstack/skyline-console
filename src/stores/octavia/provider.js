// Copyright 2025 99cloud
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

export class LoadBalancerProviderStore extends Base {
  get client() {
    return client.octavia.providers;
  }

  get listWithDetail() {
    return false;
  }

  /**
   * Fetches the list of available load balancer providers from the Octavia API.
   *
   * If the API call fails (e.g., endpoint doesn't exist, network error, etc.),
   * it falls back to a static list of commonly available providers.
   *
   * @param {Object} params - Optional parameters for the API call
   * @returns {Promise} Promise that resolves to the API response
   */
  async listFetchByClient(params) {
    try {
      const result = await this.client.list(params);
      const providers = result?.providers || [];

      const transformedProviders = providers.map((provider) => ({
        label: provider.name,
        value: provider.name,
        ...provider,
      }));

      return transformedProviders;
    } catch (error) {
      console.warn('Failed to fetch providers from API', error);
    }
  }
}

const globalLoadBalancerProviderStore = new LoadBalancerProviderStore();
export default globalLoadBalancerProviderStore;
