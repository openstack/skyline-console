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

  get formItems() {
    return [
      {
        name: "clusterName",
        label: t("Cluster Name"),
        type: "input",
        placeholder: t("Cluster Name"),
        required: true
      },
      {
        name: "image",
        label: t("Image"),
        type: "input",
        placeholder: t("Name or ID og the container image"),
        required: true
      },
      {
        name: "imageDriver",
        label: t("Image Driver"),
        placeholder: t("Image Driver"),
        type: "select",
        options: [
          {
            label: t("Docker"),
            value: "docker"
          },
          {
            label: t("Glance"),
            value: "glance"
          }
        ],
        allowClear: true
      },
      {
        name: "command",
        label: t("Command"),
        type: "input",
        placeholder: t("A command that will be sent to the container"),
      },
    ]
  }
}

export default inject('rootStore')(observer(StepInfo));