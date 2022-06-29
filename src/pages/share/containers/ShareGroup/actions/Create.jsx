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
import { ModalAction } from 'containers/Action';
import globalShareGroupStore from 'stores/manila/share-group';
import { ShareNetworkStore } from 'stores/manila/share-network';
import { ShareGroupTypeStore } from 'stores/manila/share-group-type';
import { ShareStore } from 'stores/manila/share';
import {
  shareGroupTypeColumns,
  shareGroupTypeFilters,
} from 'resources/manila/share-group-type';
import {
  shareTypeColumns,
  shareTypeFilters,
  checkShareTypeSupportServer,
  shareTypeTip,
} from 'resources/manila/share-type';
import {
  getShareNetworkColumns,
  shareNetworkFilters,
} from 'resources/manila/share-network';
import { cloneDeep } from 'lodash';
import { idNameColumn } from 'utils/table';

export class Create extends ModalAction {
  static id = 'create';

  static title = t('Create Share Group');

  get name() {
    return t('create share group');
  }

  init() {
    this.store = globalShareGroupStore;
    this.networkStore = new ShareNetworkStore();
    this.groupTypeStore = new ShareGroupTypeStore();
    this.shareStore = new ShareStore();
    this.groupTypeStore.fetchList();
    this.networkStore.fetchList();
    this.getZones();
    this.state.types = [];
    this.state.showNetworks = false;
  }

  static policy = 'share_group:create';

  static allowed = () => Promise.resolve(true);

  static get modalSize() {
    return 'large';
  }

  getModalSize() {
    return 'large';
  }

  getZones() {
    this.shareStore.fetchAvailableZones();
  }

  getShareTypes() {
    return [];
  }

  onGroupTypeChange = (value) => {
    const { selectedRows = [] } = value;
    if (selectedRows.length === 0) {
      this.setState({ types: [] });
      return;
    }
    this.setState({
      types: selectedRows[0].shareTypes,
    });
  };

  onShareTypeChange = (value) => {
    const { selectedRows = [] } = value;
    if (selectedRows.length === 0) {
      this.setState({ showNetworks: false });
      return;
    }
    const disabledItem = selectedRows.some((it) => {
      return !checkShareTypeSupportServer(it);
    });
    this.setState({
      showNetworks: !disabledItem,
    });
  };

  get groupTypes() {
    return this.groupTypeStore.list.data || [];
  }

  get shareGroupTypeColumns() {
    const [, ...rest] = cloneDeep(shareGroupTypeColumns);
    return [idNameColumn, ...rest];
  }

  get shareTypeColumns() {
    const [, ...rest] = cloneDeep(shareTypeColumns);
    return [idNameColumn, ...rest];
  }

  get shareNetworkColumns() {
    const [, ...rest] = getShareNetworkColumns(this);
    return [idNameColumn, ...rest];
  }

  get formItems() {
    const { types = [], showNetworks = false } = this.state;
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        required: true,
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
      },
      {
        name: 'availability_zone',
        label: t('Availability Zone'),
        type: 'select',
        options: this.shareStore.zoneOptions,
      },
      {
        name: 'shareGroupType',
        label: t('Share Group Type'),
        type: 'select-table',
        required: true,
        onChange: this.onGroupTypeChange,
        columns: this.shareGroupTypeColumns,
        filterParams: shareGroupTypeFilters,
        isLoading: this.groupTypeStore.list.isLoading,
        data: this.groupTypes,
        disabledFunc: (item) => !item.shareTypes.length,
      },
      {
        name: 'shareType',
        label: t('Share Type'),
        type: 'select-table',
        isMulti: true,
        required: true,
        columns: this.shareTypeColumns,
        filterParams: shareTypeFilters,
        data: types,
        display: !!types.length,
        onChange: this.onShareTypeChange,
        extra: shareTypeTip,
      },
      {
        name: 'shareNetwork',
        label: t('Share Network'),
        type: 'select-table',
        columns: this.shareNetworkColumns,
        filterParams: shareNetworkFilters,
        isLoading: this.networkStore.list.isLoading,
        data: this.networkStore.list.data || [],
        display: showNetworks,
        required: showNetworks,
      },
    ];
  }

  onSubmit = (values) => {
    const { shareGroupType, shareType, shareNetwork, ...rest } = values;
    const { showNetworks = false } = this.state;
    const body = {
      ...rest,
      share_group_type_id: shareGroupType.selectedRowKeys[0],
      share_types: shareType.selectedRowKeys,
    };
    const { selectedRowKeys = [] } = shareNetwork || {};
    if (showNetworks && selectedRowKeys.length) {
      body.share_network_id = selectedRowKeys[0];
    }
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(Create));
