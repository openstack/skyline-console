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
    return this.client.resize(id, newbody);
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
    const [fr = {}, mfr = {}, fx = {}, sub = {}] = await Promise.all([
      flavorId ? this.flavorClient.show(flavorId) : {},
      masterFlavorId ? this.flavorClient.show(masterFlavorId) : {},
      fixedNetworkId ? this.networkClient.show(fixedNetworkId) : {},
      fixedSubnetId ? this.subnetClient.show(fixedSubnetId) : {},
    ]);
    const { flavor } = fr;
    const { flavor: masterFlavor } = mfr;
    const { network: fixedNetwork } = fx;
    const { subnet: fixedSubnet } = sub;
    if (flavor) {
      item.flavor = flavor;
    }
    if (masterFlavor) {
      item.masterFlavor = masterFlavor;
    }
    if (fixedNetwork) {
      item.fixedNetwork = fixedNetwork;
    }
    if (fixedSubnet) {
      item.fixedSubnet = fixedSubnet;
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
