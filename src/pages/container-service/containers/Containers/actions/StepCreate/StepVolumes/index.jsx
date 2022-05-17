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
import ZunVolume from "src/components/FormItem/ZunVolume";
import globalVolumeStore from "src/stores/cinder/volume";

export class StepVolumes extends Base {

  init() {
    this.globalVolumeStore = globalVolumeStore;
    this.getVolumeStore();
  }

  get cinderVolume() {
    return (this.globalVolumeStore.list.data || [])
      .filter((it) => it.status === 'available')
      .map((it) => ({
        value: it.id,
        label: it.name === '' ? it.id : it.name,
      }));
  }

  getVolumeStore() {
    this.globalVolumeStore.fetchList();
  }

  get formItems() {
    return [
      {
        name: "mounts",
        label: t("Type"),
        type: 'add-select',
        optionsType: [{ label: "Existing Cinder Volume", value: "cinder-available" }, { label: "New Cinder Volume", value: "cinder-new" }],
        optionsSource: this.cinderVolume,
        itemComponent: ZunVolume,
      },
    ]
  }
}

export default inject('rootStore')(observer(StepVolumes));