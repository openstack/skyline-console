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

import StepInfo from "./StepInfo";
import StepNodeSpec from "./StepNodeSpec";
import StepNetwork from "./StepNetwork";
import StepLabel from "./StepLabel";
import { inject, observer } from "mobx-react";
import { StepAction } from "src/containers/Action";
import globalClusterTemplateStore from "src/stores/magnum/clusterTemplates";
import { toJS } from "mobx";

export class StepCreate extends StepAction {
  init() {
    this.store = globalClusterTemplateStore;
    this.getDetail();
  }

  static id = "create-cluster-template";

  static title = t("Create Cluster Template");

  static path = "/container-infra/cluster-template/create";

  static policy = "container-infra:clustertemplate:create";

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t("Create Cluster Template");
  }

  get listUrl() {
    return this.getRoutePath("clusterTemplate");
  }

  get isEdit() {
    const { pathname } = this.props.location;
    return pathname.indexOf('update') >= 0;
  }

  get hasExtraProps() {
    return this.isEdit;
  }

  get hasConfirmStep() {
    return false;
  }

  get params() {
    const { id } = this.props.match.params;
    return { id };
  }

  async getDetail() {
    if (this.isEdit) {
      const result = await globalClusterTemplateStore.fetchDetail(this.params);
      this.setState({
        extra: toJS(result),
      });
    }
  }

  get steps() {
    return [
      {
        title: t("Info *"),
        component: StepInfo
      },
      {
        title: t("Node Spec *"),
        component: StepNodeSpec
      },
      {
        title: t("Network"),
        component: StepNetwork
      },
      {
        title: t("Labels"),
        component: StepLabel
      }
    ]
  }

  onSubmit = (values) => {
    const requestLabels = {};
    const { additionalLabels } = values;
    if (additionalLabels) {
      additionalLabels.forEach(item => {
        const labelKey = item.value.key.toLowerCase().trim();
        const labelValue = item.value.value.toLowerCase().trim();
        requestLabels[labelKey] = labelValue;
      })
    }

    const body = {
      labels: {
        ...requestLabels,
        admission_control_list: 'NodeRestriction,NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,TaintNodesByCondition,Priority,DefaultTolerationSeconds,DefaultStorageClass,StorageObjectInUseProtection,PersistentVolumeClaimResize,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,RuntimeClass'
      },
      fixed_subnet: values.fixedSubnet,
      master_flavor_id: values.masterFlavor,
      http_proxy: values.HTTPProxy != null ? values.HTTPProxy : null,
      https_proxy: values.HTTPSProxy != null ? values.HTTPSProxy : null,
      no_proxy: values.noProxy != null ? values.noProxy : null,
      keypair_id: values.keypair,
      docker_volume_size: values.dockerVolumeSize,
      external_network_id: values.externalNetworkID,
      image_id: values.image,
      volume_driver: values.volumeDriver,

      public: values.cluster_template_public,
      hidden: values.cluster_template_hidden,
      tls_disabled: values.tls_disabled,
      registry_enabled: values.docker_registry_enabled,
      master_lb_enabled: values.masterLB,
      floating_ip_enabled: values.floatingIP,

      docker_storage_driver: values.dockerStorageDriver,
      name: values.clusterTemplateName,
      network_driver: values.networkDriver,
      fixed_network: values.fixedNetwork,
      coe: values.coe,
      flavor_id: values.flavor,
      dns_nameserver: values.DNS,
    }

    if (this.isEdit) {
      return this.store.update({ id: this.params.id }, body);
    } else {
      return this.store.create(body);
    }
  }
}

export default inject("rootStore")(observer(StepCreate))