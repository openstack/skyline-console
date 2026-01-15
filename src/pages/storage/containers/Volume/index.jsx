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

import { toJS } from 'mobx';
import { observer, inject } from 'mobx-react';
import BaseList from 'containers/List';
import {
  volumeTransitionStatuses,
  volumeFilters,
  getVolumeColumnsList,
  getCosVolumeColumnsList,
} from 'resources/cinder/volume';
import cosVolumeStore from 'stores/cos/volume';
import { SnapshotVolumeStore } from 'stores/cinder/snapshot-volume';
import { InstanceVolumeStore } from 'stores/nova/instance-volume';
import { emptyActionConfig } from 'utils/constants';
import actionConfigs from './actions';

export class Volume extends BaseList {
  init() {
    if (this.isVolumeSnapshotDetail) {
      this.store = new SnapshotVolumeStore();
    } else if (this.inDetailPage) {
      this.store = new InstanceVolumeStore();
      this.downloadStore = this.store;
    } else {
      this.store = cosVolumeStore;
      this.downloadStore = cosVolumeStore;
      // Controls auto-refreshing while the data is in transition
      this.dataDurationTransition = 0.5;
      this.prevHasTransitionData = false;
    }
  }

  get policy() {
    return 'volume:get_all';
  }

  get name() {
    return t('volumes');
  }

  get isRecycleBinDetail() {
    return this.inDetailPage && this.path.includes('recycle-bin');
  }

  get isVolumeSnapshotDetail() {
    return this.inDetailPage && this.path.includes('storage/snapshot');
  }

  get isInstanceDetail() {
    return this.inDetailPage && this.path.includes('compute/instance');
  }

  get actionConfigs() {
    if (this.isRecycleBinDetail) {
      return emptyActionConfig;
    }
    if (this.isAdminPage) {
      return this.inDetailPage && !this.isVolumeSnapshotDetail
        ? actionConfigs.instanceDetailAdminConfig
        : actionConfigs.adminConfig;
    }
    return this.inDetailPage
      ? actionConfigs.instanceDetailConfig
      : actionConfigs.actionConfigs;
  }

  get transitionStatusList() {
    return volumeTransitionStatuses;
  }

  get isFilterByBackend() {
    return false;
  }

  get isSortByBackend() {
    return this.isFilterByBackend;
  }

  get adminPageHasProjectFilter() {
    return true;
  }

  get defaultSortKey() {
    return 'created_at';
  }

  getColumns = () => {
    // In Volume Snapshot page or Instance detail page, use the cinder volume columns
    // In Volume list page, use the COS volume columns instead
    if (this.isVolumeSnapshotDetail || this.inDetailPage) {
      return getVolumeColumnsList(this);
    }
    return getCosVolumeColumnsList(this);
  };

  get searchFilters() {
    return volumeFilters;
  }

  get itemInTransitionFunction() {
    return ({ volumeStatus }) => {
      return volumeStatus?.isProcessing || false;
    };
  }

  getDataSource = () => {
    const { data, filters = {} } = this.list;
    const { timeFilter = {} } = this.state;
    const { id, tab, ...rest } = filters;
    const newFilters = rest;

    let items = [];
    if (this.isFilterByBackend) {
      items = toJS(data);
    } else {
      items = (toJS(data) || []).filter((it) =>
        this.filterData(
          it,
          toJS(newFilters),
          Object.keys(timeFilter).length ? toJS(timeFilter) : undefined
        )
      );
      this.updateList({ total: items.length });
    }

    // Check if any item is still in transition
    const hasTransData = items.some((item) =>
      this.itemInTransitionFunction(item)
    );

    // When there are items in transition → use short polling
    // When transitioning from "has transition" → "no transition"
    if (hasTransData) {
      this.setRefreshDataTimerTransition();
    } else {
      // Trigger one more immediate refresh to ensure the list is up-to-date
      if (this.prevHasTransitionData) {
        this.handleRefresh(true);
      }
      // Fall back to normal polling
      this.setRefreshDataTimerAuto();
    }

    this.prevHasTransData = hasTransData;
    this.updateHintsByData(items);
    this.setTableHeight();
    return items;
  };

  updateFetchParams = (params) => {
    if (this.isVolumeSnapshotDetail) {
      const { child_volumes = [] } = this.props.detail || {};
      const volumeIds = child_volumes.map((it) => it.volume_id);
      const { id, ...rest } = params;
      return {
        ...rest,
        volumeIds,
      };
    }
    if (this.inDetailPage) {
      const { id, ...rest } = params;
      return {
        ...rest,
        serverId: id,
      };
    }
    return params;
  };
}

export default inject('rootStore')(observer(Volume));
