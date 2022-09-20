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

import { inject, observer } from 'mobx-react';
import globalAggregateStore from 'stores/nova/aggregate';
import { ModalAction } from 'containers/Action';
import globalAvailabilityZoneStore from 'stores/nova/zone';
import { getYesNoList } from 'utils/index';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Host Aggregate');

  init() {
    this.store = globalAggregateStore;
    this.azStore = globalAvailabilityZoneStore;
    this.getAvailabilityZones();
  }

  getAvailabilityZones() {
    this.azStore.fetchListWithoutDetail();
  }

  get azList() {
    const azList = (this.azStore.list.data || []).map((it) => ({
      label: it.zoneName,
      value: it.zoneName,
    }));
    azList.push({ label: t('Not select'), value: 'noSelect' });
    return azList;
  }

  get name() {
    return t('Create host aggregate');
  }

  static policy = 'os_compute_api:os-aggregates:create';

  static allowed = () => Promise.resolve(true);

  get defaultValue() {
    return {
      isCreate: false,
      availabilityZone: (this.azList[0] || []).value,
    };
  }

  get formItems() {
    const { isCreate = false } = this.state;
    const azTip = t(
      'It is suggested to use the marked AZ directly, too much AZ will lead to the fragmentation of available resources'
    );
    const azNewTip = t(
      'A host aggregate can be associated with at most one AZ. Once the association is established, the AZ cannot be disassociated.'
    );
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        placeholder: t('Please input name'),
        required: true,
      },
      {
        name: 'isCreate',
        label: t('Create new AZ'),
        tip: azTip,
        type: 'radio',
        options: getYesNoList(),
      },
      {
        name: 'availabilityZone',
        label: t('Availability Zone'),
        type: 'select',
        options: this.azList,
        tip: azNewTip,
        hidden: isCreate,
        required: !isCreate,
      },
      {
        name: 'newAz',
        label: t('New Availability Zone'),
        type: 'input',
        help: azTip,
        hidden: !isCreate,
        required: isCreate,
      },
    ];
  }

  onSubmit = (values) => {
    const { isCreate, availabilityZone, newAz, ...rest } = values;
    const curAZ = availabilityZone !== 'noSelect' ? availabilityZone : null;
    const data = {
      ...rest,
      availability_zone: isCreate ? newAz : curAZ,
    };
    return globalAggregateStore.create(data);
  };
}

export default inject('rootStore')(observer(Create));
