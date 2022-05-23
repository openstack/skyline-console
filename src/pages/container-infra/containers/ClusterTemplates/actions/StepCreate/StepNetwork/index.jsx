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

import Base from 'components/Form';
import { inject, observer } from 'mobx-react';
import globalNetworkStore from 'src/stores/neutron/network';
import globalSubnetStore from 'src/stores/neutron/subnet';

export class StepNetwork extends Base {
  init() {
    this.getFloatingIps();
    this.getSubnets();
    this.state = { selectedSubnetId: '' };
  }

  get title() {
    return t('Network');
  }

  get name() {
    return t('Network');
  }

  get isStep() {
    return true;
  }

  get isEdit() {
    return !!this.props.extra;
  }

  async getFloatingIps() {
    globalNetworkStore.fetchList();
  }

  get getFloatingIpList() {
    return (globalNetworkStore.list.data || [])
      .filter((it) => it['router:external'] === true && it.project_id === this.currentProjectId)
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  get getPrivateFloatingIpList() {
    return (globalNetworkStore.list.data || [])
      .filter((it) => it['router:external'] === false && it.project_id === this.currentProjectId)
      .map((it) => ({
        value: it.id,
        label: it.name,
        subnetId: it.subnets,
      }));
  }

  async getSubnets() {
    globalSubnetStore.fetchList();
  }

  get getSubnetList() {
    return (globalSubnetStore.list.data || [])
      .filter((it) => this.state.selectedSubnetId === it.network_id)
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  onSelectChangeFixedNetwork(value) {
    this.setState({
      selectedSubnetId: value,
    });
    this.resetFormValue(['fixedSubnet']);
  }

  get getNetworkDriver() {
    const { context = {} } = this.props;
    const {
      coeSelectRows = "",
      coe = ""
    } = context;
    let networkDriver = [];
    if (!coeSelectRows || !coe) {
      networkDriver.push({ val: "docker", name: "Docker" }, { val: "flannel", name: "Flannel" }, { val: "calico", name: "Calico" })
    }
    if (coeSelectRows === "swarm" || coeSelectRows === "swarm-mode") {
      networkDriver.push({ val: "docker", name: "Docker" }, { val: "flannel", name: "Flannel" })
    }
    if (coeSelectRows === "kubernetes") {
      networkDriver.push({ val: "calico", name: "Calico" }, { val: "flannel", name: "Flannel" })
    }
    if (coeSelectRows === "mesos" || coeSelectRows === "dcos") {
      networkDriver.push({ val: "docker", name: "Docker" })
    }
    return (networkDriver || [])
      .map((it) => ({
        value: it.val,
        label: it.name,
      }));
  }

  get defaultValue() {
    const values = {};

    if (this.isEdit) {
      values.networkDriver = this.props.extra.network_driver;
      values.HTTPProxy = this.props.extra.http_proxy;
      values.HTTPSProxy = this.props.extra.https_proxy;
      values.noProxy = this.props.extra.no_proxy;
      values.externalNetworkID = this.props.extra.external_network_id;
      values.fixedNetwork = this.props.extra.fixed_network;
      values.fixedSubnet = this.props.extra.fixed_subnet;
      values.DNS = this.props.extra.dns_nameserver;
      values.masterLB = this.props.extra.master_lb_enabled;
      values.floatingIP = this.props.extra.floating_ip_enabled;
    }
    return values;
  }

  get formItems() {
    return [
      {
        name: "networkDriver",
        label: t("Network Driver"),
        placeholder: t("Choose a Network Driver"),
        type: "select",
        options: this.getNetworkDriver,
        allowClear: true,
        showSearch: true
      },
      {
        name: "HTTPProxy",
        label: t("HTTP Proxy"),
        placeholder: t("The http_proxy address to use for nodes in cluster"),
        type: "input"
      },
      {
        name: "HTTPSProxy",
        label: t("HTTPS Proxy"),
        placeholder: t("The https_proxy address to use for nodes in cluster"),
        type: "input"
      },
      {
        name: "noProxy",
        label: t("No Proxy"),
        placeholder: t("The no_proxy address to use for nodes in cluster"),
        type: "input"
      },
      {
        name: "externalNetworkID",
        label: t("External Network ID"),
        placeholder: t("Choose a External Network ID"),
        type: "select",
        options: this.getFloatingIpList,
        allowClear: true,
        showSearch: true
      },
      {
        name: "fixedNetwork",
        label: t("Fixed Network"),
        placeholder: t("Choose a Private Network ID"),
        type: "select",
        options: this.getPrivateFloatingIpList,
        onChange: (val) => this.onSelectChangeFixedNetwork(val),
        allowClear: true,
        showSearch: true
      },
      {
        name: "fixedSubnet",
        label: t("Fixed Subnet"),
        placeholder: t("Choose a Private Network at first"),
        type: "select",
        options: this.getSubnetList,
        allowClear: true,
        showSearch: true
      },
      {
        name: "DNS",
        label: t("DNS"),
        placeholder: t("The DNS nameserver to use for this cluster template"),
        type: "input"
      },
      {
        name: "masterLB",
        label: t("Master LB"),
        type: "check"
      },
      {
        name: "floatingIP",
        label: t("Floating IP"),
        type: "check"
      }
    ]
  }
}

export default inject("rootStore")(observer(StepNetwork))