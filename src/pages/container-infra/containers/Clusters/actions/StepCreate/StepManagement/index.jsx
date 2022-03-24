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

export class StepManagement extends Base {

  get title() {
    return t("Cluster Management")
  }

  get name() {
    return t("Cluster Management")
  }

  get formItems() {
    return [
      {
        name: "auto_healing_enabled",
        label: t("Auto Healing"),
        type: "check",
        content: t("Automatically repair unhealhty nodes")
      },
      {
        type: "divider"
      },
      {
        name: "auto_scaling_enabled",
        label: t("Auto Scaling"),
        type: "check",
        content: t("Auto scaling feature will be enabled")
      }
    ]
  }
}

export default inject("rootStore")(observer(StepManagement))