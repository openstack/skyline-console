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

import { observer, inject } from 'mobx-react';
import Base from 'containers/List';
import globalShareGroupStore, {
  ShareGroupStore,
} from 'stores/manila/share-group';
import {
  getShareGroupColumns,
  shareGroupFilters,
} from 'resources/manila/share-group';
import actionConfigs from './actions';

export class ShareGroup extends Base {
  init() {
    this.store = globalShareGroupStore;
    this.downloadStore = new ShareGroupStore();
  }

  get policy() {
    return 'share_group:get_all';
  }

  get name() {
    return t('share groups');
  }

  get isFilterByBackend() {
    return true;
  }

  get isSortByBackend() {
    return true;
  }

  get defaultSortKey() {
    return 'created_at';
  }

  get actionConfigs() {
    return this.isAdminPage
      ? actionConfigs.actionConfigsAdmin
      : actionConfigs.actionConfigs;
  }

  getColumns = () => getShareGroupColumns(this);

  get searchFilters() {
    return shareGroupFilters;
  }
}

export default inject('rootStore')(observer(ShareGroup));
