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

export class LoadBalancerFlavorStore extends Base {
  get client() {
    return client.octavia.flavors;
  }

  get listWithDetail() {
    return false;
  }

  listDidFetch(items, allProject, originParams) {
    if (!items.length) {
      return items;
    }
    const { enabled } = originParams || {};
    if (enabled === undefined) {
      return items;
    }
    return items.filter((it) => it.enabled === enabled);
  }
}

const globalLoadBalancerFlavorStore = new LoadBalancerFlavorStore();

export default globalLoadBalancerFlavorStore;
