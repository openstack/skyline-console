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


import globalImageStore from "src/stores/glance/image";
import globalKeypairStore from "src/stores/nova/keypair";
import Base from "components/Form";
import { inject, observer } from "mobx-react";
import React from 'react';
import FlavorSelectTable from "src/pages/compute/containers/Instance/components/FlavorSelectTable";

export class StepNodeSpec extends Base {
  init() {
    this.getImageOsDistro();
    this.getKeypairs();
  }

  get title() {
    return t("Node Spec");
  }

  get name() {
    return t("Node Spec");
  }

  async getImageOsDistro() {
    globalImageStore.fetchList();
  }

  get isStep() {
    return true;
  }

  get isEdit() {
    return !!this.props.extra;
  }

  get getImageOsDistroList() {
    return (globalImageStore.list.data || [])
      .filter((it) => it.name.indexOf('coreos') >= 0)
      .filter((it) => it.owner === this.currentProjectId)
      .map((it) => ({
        value: it.id,
        label: it.name,
      }));
  }

  async getKeypairs() {
    globalKeypairStore.fetchList();
  }

  get getKeypairList() {
    return (globalKeypairStore.list.data || []).map((it) => ({
      value: it.name,
      label: it.name,
    }));
  }

  get getVolumeDriver() {
    const { context = {} } = this.props;
    const {
      coeSelectRows = "",
      coe = ""
    } = context;
    let volumeDriver = [];
    if (!coeSelectRows || !coe) {
      volumeDriver.push({ val: "cinder", name: "Cinder" }, { val: "rexray", name: "Rexray" })
    }
    if (coeSelectRows === "kubernetes") {
      volumeDriver.push({ val: "cinder", name: "Cinder" })
    }
    else if (coeSelectRows) {
      volumeDriver.push({ val: "rexray", name: "Rexray" })
    }
    return (volumeDriver || [])
      .map((it) => ({
        value: it.val,
        label: it.name,
      }));
  }

  onFlavorChange = (value) => {
    this.updateContext({
      flavor: value,
    });
  };

  get defaultValue() {
    const values = {};

    if (this.isEdit) {
      values.image = this.props.extra.image_id;
      values.keypair = this.props.extra.keypair_id;
      values.flavorCurrent = this.props.extra.flavor_id;
      values.flavor = this.props.extra.flavor_id;
      values.masterFlavor = this.props.extra.master_flavor_id;
      values.masterFlavorCurrent = this.props.extra.master_flavor_id;
      values.volumeDriver = this.props.extra.volume_driver;
      values.dockerStorageDriver = this.props.extra.docker_storage_driver;
      values.dockerVolumeSize = this.props.extra.docker_volume_size;
    }
    return values;
  }

  get formItems() {
    return [
      {
        name: "image",
        label: t("Image"),
        type: "select",
        options: this.getImageOsDistroList,
        allowClear: true,
        showSearch: true
      },
      {
        name: "keypair",
        label: t("Keypair"),
        type: "select",
        options: this.getKeypairList,
        allowClear: true,
        showSearch: true
      },
      {
        name: 'flavorCurrent',
        label: t('Current Flavor'),
        type: 'label',
        iconType: 'flavor',
      },
      {
        name: 'flavor',
        label: t('Flavor'),
        type: 'select-table',
        component: (
          <FlavorSelectTable onChange={this.onFlavorChange} />
        ),
      },
      {
        name: 'masterFlavorCurrent',
        label: t('Current Master Flavor'),
        type: 'label',
        iconType: 'flavor',
      },
      {
        name: "masterFlavor",
        label: t("Master Flavor"),
        type: "select-table",
        component: (
          <FlavorSelectTable onChange={this.onFlavorChange} />
        ),
      },
      {
        name: "volumeDriver",
        label: t("Volume Driver"),
        type: "select",
        options: this.getVolumeDriver,
        allowClear: true,
        showSearch: true
      },
      {
        name: "dockerStorageDriver",
        label: t("Docker Storage Driver"),
        type: "select",
        options: [
          {
            label: t("Overlay"),
            value: "overlay"
          },
          {
            label: t("Overlay2"),
            value: "overlay2"
          }
        ],
        allowClear: true,
        showSearch: true
      },
      {
        name: "dockerVolumeSize",
        label: t("Docker Volume Size (GB)"),
        type: "input-number",
        min: "1",
        placeholder: "Spec"
      }
    ]
  }
}

export default inject("rootStore")(observer(StepNodeSpec))