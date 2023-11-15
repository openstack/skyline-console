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

export class ListenerStore extends Base {
  get client() {
    return client.octavia.listeners;
  }

  get poolClient() {
    return client.octavia.pools;
  }

  get healthMonitorClient() {
    return client.octavia.healthMonitors;
  }

  get lbClient() {
    return client.octavia.loadbalancers;
  }

  get listFilterByProject() {
    return true;
  }

  get mapperBeforeFetchProject() {
    return (data) => ({
      ...data,
      lbIds: data.loadbalancers.map((lb) => lb.id),
    });
  }

  // async listDidFetch(items, allProjects, filters) {
  //   if (items.length === 0) {
  //     return items;
  //   }
  //   const { loadBalancerId } = filters;
  //   const data = items.filter(it =>
  //     it.lbIds.indexOf(loadBalancerId) !== -1
  //   );
  //   return data;
  // }

  async detailDidFetch(item) {
    const {
      default_pool_id,
      default_tls_container_ref,
      client_ca_tls_container_ref,
      sni_container_refs,
    } = item;
    const [, serverId] = (default_tls_container_ref || '').split(
      '/containers/'
    );
    const [, caId] = (client_ca_tls_container_ref || '').split('/secrets/');
    const sniId = (sni_container_refs || []).map((it) => {
      const [, ssid] = it.split('/containers/');
      return ssid;
    });
    Object.assign(item, {
      serverCertificateId: serverId,
      caCertificateId: caId,
      sniCertificateId: sniId,
    });
    const { loadbalancers = [] } = item;
    const { loadbalancer } = await this.lbClient.show(loadbalancers[0].id);
    item.loadBalancer = loadbalancer;
    if (default_pool_id) {
      //  pool attach listener or loadbalancer ？
      try {
        const { pool } = await this.poolClient.show(default_pool_id);
        item.default_pool = pool;
        const { healthmonitor_id } = pool;
        if (healthmonitor_id) {
          const { healthmonitor } = await this.healthMonitorClient.show(
            healthmonitor_id
          );
          item.healthMonitor = healthmonitor;
        }
        return item;
      } catch (err) {
        return item;
      }
    } else {
      return item;
    }
  }
}

const globalListenerStore = new ListenerStore();

export default globalListenerStore;
