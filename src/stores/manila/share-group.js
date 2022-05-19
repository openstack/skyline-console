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

import { action } from 'mobx';
import client from 'client';
import Base from 'stores/base';
import { ShareGroupTypeStore } from './share-group-type';
import { ShareNetworkStore } from './share-network';

export class ShareGroupStore extends Base {
  get client() {
    return client.manila.shareGroups;
  }

  get listWithDetail() {
    return true;
  }

  get paramsFuncPage() {
    return (params) => {
      const { all_projects, current, keywords, ...rest } = params;
      const newParams = { ...rest };
      if (all_projects) {
        newParams.all_tenants = 1;
      }
      return newParams;
    };
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  async detailDidFetch(item, all_projects) {
    const { share_network_id, share_group_type_id, share_types } = item;
    const shareGroupType = await new ShareGroupTypeStore().fetchDetail({
      id: share_group_type_id,
      all_projects,
    });
    const shareTypes = share_types.map((it) => {
      const typeItem = shareGroupType.shareTypes.find((st) => st.id === it);
      return typeItem || { id: it };
    });
    let shareNetwork = null;
    if (share_network_id) {
      shareNetwork = await new ShareNetworkStore().fetchDetail({
        id: share_network_id,
      });
    }

    return {
      ...item,
      shareGroupType,
      shareTypes,
      shareNetwork,
    };
  }

  @action
  update(id, data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(this.client.update(id, body));
  }
}

const globalShareGroupStore = new ShareGroupStore();
export default globalShareGroupStore;
