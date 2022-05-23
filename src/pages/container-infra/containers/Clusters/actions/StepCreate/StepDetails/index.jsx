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

import globalClusterTemplateStore from 'stores/magnum/clusterTemplates';
import globalAvailabilityZoneStore from 'stores/nova/zone';
import globalKeypairStore from 'stores/nova/keypair';

export class StepDetails extends Base {
  init() {
    this.getClustertemplates();
    this.getAvailableZones();
    this.getKeypairs();
  }

  get title() {
    return t('Cluster Detail');
  }

  get name() {
    return t('Cluster Detail');
  }

  async getClustertemplates() {
    globalClusterTemplateStore.fetchList();
  }

  get getClusterTemplateList() {
    return (globalClusterTemplateStore.list.data || []).map((it) => ({
      value: it.uuid,
      label: it.name,
    }));
  }

  async getAvailableZones() {
    globalAvailabilityZoneStore.fetchListWithoutDetail();
  }

  get getAvailableZonesList() {
    return (globalAvailabilityZoneStore.list.data || [])
      .filter((it) => it.zoneState.available)
      .map((it) => ({
        value: it.zoneName,
        label: it.zoneName,
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

  get formItems() {
    return [
      {
        name: "clusterName",
        label: t("Cluster Name"),
        type: "input",
        required: true
      },
      {
        name: "clusterTemplateId",
        label: t("Cluster Template"),
        type: "select",
        placeholder: t('Please select'),
        options: this.getClusterTemplateList,
        allowClear: true,
        showSearch: true,
        required: true
      },
      {
        name: "availabilityZone",
        label: t("Availability Zone"),
        type: "select",
        options: this.getAvailableZonesList,
        allowClear: true,
        showSearch: true,
        required: true
      },
      {
        name: "keypair",
        label: t("Keypair"),
        type: "select",
        options: this.getKeypairList,
        allowClear: true,
        showSearch: true,
        required: true
      }
    ]
  }
}

export default inject("rootStore")(observer(StepDetails))