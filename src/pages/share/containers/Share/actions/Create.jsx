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
import { FormAction } from 'containers/Action';
import globalShareStore, { ShareStore } from 'stores/manila/share';
import { ShareNetworkStore } from 'stores/manila/share-network';
import { ShareGroupStore } from 'stores/manila/share-group';
import { ShareTypeStore } from 'stores/manila/share-type';
import {
  getShareGroupColumns,
  shareGroupFilters,
} from 'resources/manila/share-group';
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
import {
  shareProtocol,
  getQuota,
  getQuotaInfo,
  fetchShareQuota,
  checkQuotaDisable,
  getShareSizeInStore,
  setCreateShareSize,
  onShareSizeChange,
} from 'resources/manila/share';
import { cloneDeep, isEmpty } from 'lodash';
import { idNameColumn } from 'utils/table';
import { extraFormItem } from 'pages/share/containers/ShareType/actions/Create';
import { updateAddSelectValueToObj, getOptions } from 'utils/index';
import { checkPolicyRule } from 'resources/skyline/policy';

const quotaKeys = ['shares', 'gigabytes'];

const getWishes = () => {
  return [1, getShareSizeInStore() || 1];
};

export class Create extends FormAction {
  static id = 'create';

  static title = t('Create Share');

  static path = '/share/share/create';

  get name() {
    return t('create share');
  }

  get listUrl() {
    return this.getRoutePath('share');
  }

  init() {
    this.store = globalShareStore;
    this.networkStore = new ShareNetworkStore();
    this.shareTypeStore = new ShareTypeStore();
    this.shareStore = new ShareStore();
    this.shareGroupStore = new ShareGroupStore();
    this.shareStore.fetchQuota();
    this.shareTypeStore.fetchList();
    this.networkStore.fetchList();
    this.shareGroupStore.fetchList();
    this.shareStore.fetchAvailableZones();
    this.state.showNetworks = false;
    this.state.shareGroups = [];
    this.getQuota();
  }

  static policy = 'share:create';

  static allowed = () => Promise.resolve(true);

  async getQuota() {
    await fetchShareQuota(this);
    setCreateShareSize(this.defaultSize);
    this.updateDefaultValue();
  }

  get disableSubmit() {
    const { quota, quotaLoading } = this.state;
    if (isEmpty(quota) || quotaLoading) {
      return true;
    }
    return checkQuotaDisable(quotaKeys, getWishes());
  }

  get showQuota() {
    return true;
  }

  getShareQuota() {
    const { quota = {} } = this.state;
    return getQuota(quota, quotaKeys);
  }

  get quotaInfo() {
    return getQuotaInfo(this, quotaKeys, getWishes());
  }

  get defaultSize() {
    const size = this.quotaIsLimit && this.maxSize < 10 ? this.maxSize : 10;
    return size;
  }

  get defaultValue() {
    const values = {
      size: this.defaultSize,
      project: this.currentProjectName,
    };
    return values;
  }

  onShareTypeChange = (value) => {
    const { selectedRows = [], selectedRowKeys = [] } = value;
    if (selectedRows.length === 0) {
      this.setState({ showNetworks: false, shareGroups: [] });
      return;
    }
    const disabledItem = selectedRows.some((it) => {
      return !checkShareTypeSupportServer(it);
    });
    const shareGroups = (this.shareGroupStore.list.data || []).filter((it) => {
      return (it.share_types || []).includes(selectedRowKeys[0]);
    });
    this.setState({
      showNetworks: !disabledItem,
      shareGroups,
    });
  };

  get quotaIsLimit() {
    const { gigabytes: { limit } = {} } = this.getShareQuota();
    return limit !== -1;
  }

  get maxSize() {
    const { gigabytes: { left = 0 } = {} } = this.getShareQuota();
    return left === -1 ? 1000 : left || 1;
  }

  get shareTypeColumns() {
    const [, ...rest] = cloneDeep(shareTypeColumns);
    return [idNameColumn, ...rest];
  }

  get shareNetworkColumns() {
    const [, ...rest] = getShareNetworkColumns(this);
    return [idNameColumn, ...rest];
  }

  get shareGroupColumns() {
    const [, ...rest] = getShareGroupColumns(this);
    return [idNameColumn, ...rest];
  }

  get shareProtocolOptions() {
    return getOptions(shareProtocol);
  }

  checkShowPublic() {
    return checkPolicyRule('share:create_public_share');
  }

  get formItems() {
    const { showNetworks = false, shareGroups = [] } = this.state;
    const minSize = 1;
    const metadataItem = {
      ...extraFormItem,
      name: 'metadata',
      label: t('Metadata'),
      addText: t('Add Metadata'),
    };
    return [
      {
        name: 'project',
        label: t('Project'),
        type: 'label',
      },
      {
        name: 'availability_zone',
        label: t('Availability Zone'),
        type: 'select',
        options: this.shareStore.zoneOptions,
      },
      {
        type: 'divider',
      },
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
        name: 'share_proto',
        label: t('Share Protocol'),
        type: 'select',
        required: true,
        options: this.shareProtocolOptions,
      },
      {
        name: 'size',
        label: t('Capacity (GiB)'),
        type: 'slider-input',
        max: this.maxSize,
        min: minSize,
        description: `${minSize}GiB-${this.maxSize}GiB`,
        required: this.quotaIsLimit,
        display: this.quotaIsLimit,
        onChange: onShareSizeChange,
      },
      {
        name: 'size',
        label: t('Capacity (GiB)'),
        type: 'input-int',
        min: minSize,
        display: !this.quotaIsLimit,
        required: !this.quotaIsLimit,
        onChange: onShareSizeChange,
      },
      {
        name: 'is_public',
        label: t('Public'),
        type: 'check',
        content: t('Public'),
        tip: t('If set then all tenants will be able to see this share.'),
        display: this.checkShowPublic(),
      },
      {
        name: 'shareType',
        label: t('Share Type'),
        type: 'select-table',
        required: true,
        columns: this.shareTypeColumns,
        filterParams: shareTypeFilters,
        isLoading: this.shareTypeStore.list.isLoading,
        data: this.shareTypeStore.list.data || [],
        onChange: this.onShareTypeChange,
        extra: shareTypeTip,
      },
      {
        type: 'divider',
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
      {
        name: 'shareGroup',
        label: t('Share Group'),
        type: 'select-table',
        columns: this.shareGroupColumns,
        filterParams: shareGroupFilters,
        isLoading: this.shareGroupStore.list.isLoading,
        data: shareGroups,
        disabledFunc: (item) => item.status !== 'available',
      },
      {
        type: 'divider',
      },
      metadataItem,
    ];
  }

  onSubmit = (values) => {
    const {
      shareType,
      shareNetwork,
      shareGroup,
      project,
      metadata,
      is_public,
      ...rest
    } = values;
    const { showNetworks = false } = this.state;
    const body = {
      ...rest,
      share_type: shareType.selectedRowKeys[0],
      metadata: updateAddSelectValueToObj(metadata),
    };
    if (this.checkShowPublic() && is_public) {
      body.is_public = is_public;
    }
    const { selectedRowKeys: networkKeys = [] } = shareNetwork || {};
    const { selectedRowKeys: groupKeys = [] } = shareGroup || {};
    if (showNetworks && networkKeys.length) {
      body.share_network_id = networkKeys[0];
    }
    if (groupKeys.length) {
      body.share_group_id = groupKeys[0];
    }
    return this.store.create(body);
  };
}

export default inject('rootStore')(observer(Create));
