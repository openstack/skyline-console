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

import Base from 'stores/base';
import client from 'client';
import { action } from 'mobx';
import { allSettled } from 'utils';

export class ClustersStore extends Base {
  get client() {
    return client.magnum.clusters;
  }

  get templateClient() {
    return client.magnum.clusterTemplates;
  }

  get flavorClient() {
    return client.nova.flavors;
  }

  get networkClient() {
    return client.neutron.networks;
  }

  get subnetClient() {
    return client.neutron.subnets;
  }

  get stackClient() {
    return client.heat.stacks;
  }

  get listWithDetail() {
    return true;
  }

  @action
  async create(newbody) {
    return this.submitting(this.client.create(newbody));
  }

  @action
  async delete({ id }) {
    return this.client.delete(id);
  }

  @action
  async resize({ id }, newbody) {
    return this.client.resize(id, newbody, null, {
      headers: { 'OpenStack-API-Version': 'container-infra latest' },
    });
  }

  async upgrade({ id }, body) {
    return this.client.upgrade(id, body);
  }

  async listDidFetch(items, _, filters) {
    if (!items.length) return items;
    const { shouldFetchProject } = filters;
    const newData = await this.listDidFetchProject(items, {
      all_projects: shouldFetchProject,
    });
    const { keypairs = [] } = (await client.nova.keypairs.list()) || {};
    return newData.map((it) => {
      const keypair = keypairs.find((k) => k?.keypair?.name === it.keypair);
      if (!keypair) {
        it.original_keypair = it.keypair;
        it.keypair = null;
      }
      return it;
    });
  }

  async detailDidFetch(item) {
    const template =
      (await this.templateClient.show(item.cluster_template_id)) || {};
    item.template = template;
    const {
      flavor_id: templateFlavorId,
      master_flavor_id: templateMasterFlavorId,
      fixed_network: templateFixedNetworkId,
      fixed_subnet: templateSubnetId,
    } = template;
    const flavorId = item.flavor_id || templateFlavorId;
    const masterFlavorId = item.master_flavor_id || templateMasterFlavorId;
    const fixedNetworkId = item.fixed_network || templateFixedNetworkId;
    const fixedSubnetId = item.fixed_subnet || templateSubnetId;
    const [kp = {}, fr = {}, mfr = {}, fx = {}, sub = {}, stack] =
      await allSettled([
        client.nova.keypairs.list(),
        flavorId ? this.flavorClient.show(flavorId) : {},
        masterFlavorId ? this.flavorClient.show(masterFlavorId) : {},
        fixedNetworkId ? this.networkClient.show(fixedNetworkId) : {},
        fixedSubnetId ? this.subnetClient.show(fixedSubnetId) : {},
        item.stack_id ? this.stackClient.list({ id: item.stack_id }) : {},
      ]);
    if (kp.status === 'fulfilled') {
      const { keypairs = [] } = kp.value;
      const keypair = keypairs.find((k) => k?.keypair?.name === item.keypair);
      if (!keypair) {
        item.original_keypair = item.keypair;
        item.keypair = null;
      }
    }
    if (fr.status === 'fulfilled') {
      const { flavor } = fr.value;
      item.flavor = flavor;
    } else {
      item.original_flavor_id = item.flavor_id;
      item.flavor_id = null;
    }
    if (mfr.status === 'fulfilled') {
      const { flavor: masterFlavor } = mfr.value;
      item.masterFlavor = masterFlavor;
    } else {
      item.original_master_flavor_id = item.master_flavor_id;
      item.master_flavor_id = null;
    }
    if (fx.status === 'fulfilled') {
      const { network: fixedNetwork } = fx.value;
      item.fixedNetwork = fixedNetwork;
    } else {
      item.original_fixed_network = item.fixed_network;
      item.fixed_network = null;
    }
    if (sub.status === 'fulfilled') {
      const { subnet: fixedSubnet } = sub.value;
      item.fixedSubnet = fixedSubnet;
    } else {
      item.original_fixed_subnet = item.fixed_subnet;
      item.fixed_subnet = null;
    }
    if (stack.status === 'fulfilled') {
      const { stacks = [] } = stack.value;
      if (stacks[0]) {
        item.stack = stacks[0];
      }
    }

    return item;
  }

  get mapper() {
    return (data) => ({
      ...data,
      id: data.uuid,
    });
  }
}

const globalClustersStore = new ClustersStore();
export default globalClustersStore;
