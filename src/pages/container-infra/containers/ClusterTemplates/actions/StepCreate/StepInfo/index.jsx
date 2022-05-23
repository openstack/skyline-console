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

import Base from "components/Form";
import { inject, observer } from "mobx-react";

export class StepInfo extends Base {
  get title() {
    return t("Info")
  }

  get name() {
    return t("Info")
  }

  get isEdit() {
    return !!this.props.extra;
  }

  get isStep() {
    return true;
  }

  onCOEChange = (value) => {
    this.updateContext({
      coeSelectRows: value,
    });
  }

  get defaultValue() {
    const values = {};

    if (this.isEdit) {
      values.clusterTemplateName = this.props.extra.name;
      values.coe = this.props.extra.coe;
      values.cluster_template_public = this.props.extra.public;
      values.cluster_template_hidden = this.props.extra.hidden;
      values.docker_registry_enabled = this.props.extra.registry_enabled;
      values.tls_disabled = this.props.extra.tls_disabled;
    }
    return values;
  }

  get formItems() {
    return [
      {
        name: "clusterTemplateName",
        label: t("Cluster Template Name"),
        type: "input",
        placeholder: t("Cluster Template Name"),
        required: true
      },
      {
        name: "coe",
        label: t("Container Orchestration Engine"),
        type: "select",
        options: [
          {
            label: t("Kubernetes"),
            value: "kubernetes"
          },
          {
            label: t("Docker Swarm"),
            value: "swarm"
          },
          {
            label: t("Docker Swarm Mode"),
            value: "swarm-mode"
          },
          {
            label: t("Mesos"),
            value: "mesos"
          },
          {
            label: t("DC/OS"),
            value: "dcos"
          },
        ],
        onChange: this.onCOEChange,
        allowClear: true,
        showSearch: true
      },
      {
        name: "cluster_template_public",
        label: t("Public"),
        type: "check"
      },
      {
        name: "cluster_template_hidden",
        label: t("Hidden"),
        type: "check"
      },
      {
        name: "docker_registry_enabled",
        label: t("Enable Registry"),
        type: "check"
      },
      {
        name: "tls_disabled",
        label: t("Disable TLS"),
        type: "check"
      }
    ]
  }
}

export default inject("rootStore")(observer(StepInfo))