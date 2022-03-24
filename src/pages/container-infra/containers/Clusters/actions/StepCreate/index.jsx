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

import StepDetails from "./StepDetails";
import StepSize from './StepSize';
import StepNetworks from './StepNetworks';
import StepManagement from './StepManagement';
import StepAdvanced from './StepAdvanced';
import { inject, observer } from "mobx-react";
import { StepAction } from "src/containers/Action";
import globalClustersStore from "src/stores/magnum/clusters";

export class StepCreate extends StepAction {
  init() {
    this.store = globalClustersStore
  }

  static id = "create-cluster";

  static title = t("Create Cluster");

  static path = "/container-infra/clusters/create";

  static policy = "container-infra:cluster:create";

  static allowed() {
    return Promise.resolve(true);
  }

  get name() {
    return t("Create Instance");
  }

  get listUrl() {
    return this.getRoutePath("containerInfraClusters");
  }

  get hasConfirmStep() {
    return false;
  }

  get steps() {
    return [
      {
        title: t("Details *"),
        component: StepDetails
      },
      {
        title: t("Size: *"),
        component: StepSize
      },
      {
        title: t("Networks"),
        component: StepNetworks
      },
      {
        title: t("Management"),
        component: StepManagement
      },
      {
        title: t("Advanced"),
        component: StepAdvanced
      }
    ]
  }

  onSubmit = (values) => {

    const { additionalLabels, auto_healing_enabled, auto_scaling_enabled } = values;
    const requestLabels = {};

    if (additionalLabels) {
      additionalLabels.forEach((item) => {
        const labelKey = item.value.key.toLowerCase().trim();
        const labelValue = item.value.value.toLowerCase().trim();
        requestLabels[labelKey] = labelValue;
      })
    }

    const data = {
      name: values.clusterName,
      labels: {
        ...requestLabels,
        auto_healing_enabled: auto_healing_enabled,
        auto_scaling_enabled: auto_scaling_enabled,
        admission_control_list: 'NodeRestriction,NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,TaintNodesByCondition,Priority,DefaultTolerationSeconds,DefaultStorageClass,StorageObjectInUseProtection,PersistentVolumeClaimResize,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,RuntimeClass'
      },
      cluster_template_id: values.clusterTemplateId,
      create_timeout: 60,
      master_count: values.numberOfMasterNodes,
      node_count: values.numberOfWorkerNodes,
      keypair: values.keypair,
      master_flavor_id: values.flavorOfMasterNodes,
      flavor_id: values.flavorOfWorkerNodes,
      master_lb_enabled: values.enableLoadBalancer,
      floating_ip_enabled: values.floating_ip_enabled === 'networkOnly' ? false : true,
    };

    if (!values.enableNetwork) {
      data.fixed_network = values.network;
    }

    return this.store.create(data);
  }
}

export default inject("rootStore")(observer(StepCreate))