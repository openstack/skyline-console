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
import globalAvailabilityZoneStore from "src/stores/nova/zone";

export class StepSpec extends Base {
  init() {
    this.getAvailabilityZones();
    this.state.isMaxRetry = true;
  }

  get title() {
    return t("Spec");
  }

  get name() {
    return t("Spec");
  }

  async getAvailabilityZones() {
    await globalAvailabilityZoneStore.fetchListWithoutDetail();
  }

  get getAvailabilityZoneList() {
    return (globalAvailabilityZoneStore.list.data || []).filter((it) => it.zoneState.available)
      .map((it) => ({
        value: it.zoneName,
        label: it.zoneName,
      }));
  }

  onExitPolicyChange(value) {
    this.setState({ isMaxRetry: value === "on-failure" ? false : true })
  }

  get formItems() {
    return [
      {
        name: "hostname",
        label: t("Hostname"),
        type: "input",
        placeholder: t("The host name of this container"),
      },
      {
        name: "runtime",
        label: t("Runtime"),
        type: "input",
        placeholder: t("The runtime to create container with"),
      },
      {
        name: "cpu",
        label: t("CPU"),
        type: "input-number",
        placeholder: t("The number of virtual cpu for this container"),
        min: 1,
        width: 300
      },
      {
        name: "memory",
        label: t("Memory"),
        type: "input-number",
        placeholder: t("The container memory size in MiB"),
        min: 4,
        width: 300
      },
      {
        name: "disk",
        label: t("Disk"),
        type: "input-number",
        placeholder: t("The disk size in GİB for per container"),
        min: 1,
        width: 300
      },
      {
        name: "availableZone",
        label: t("Availability Zone"),
        type: "select",
        options: this.getAvailabilityZoneList,
        allowClear: true,
        showSearch: true
      },
      {
        name: "exitPolicy",
        label: t("Exit Policy"),
        type: "select",
        options: [
          {
            label: t("No"),
            value: "no"
          },
          {
            label: t("On failure"),
            value: "on-failure"
          },
          {
            label: t("Always"),
            value: "always"
          },
          {
            label: t("Unless Stopped"),
            value: "unless-stopped"
          },
        ],
        onChange: (val) => this.onExitPolicyChange(val),
        allowClear: true,
        showSearch: true
      },
      {
        name: "maxRetry",
        label: t("Max Retry"),
        type: "input-number",
        placeholder: t("Retry times for 'Restart on failure' policy"),
        min: 1,
        disabled: this.state.isMaxRetry
      },
      {
        name: "enableAutoHeal",
        label: t("Enable auto heal"),
        type: "check"
      }
    ]
  }
}

export default inject('rootStore')(observer(StepSpec));