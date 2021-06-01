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

import { skylineBase } from 'utils/constants';
import Base from '../base';

export class RecycleBinStore extends Base {
  get module() {
    return 'extension/recycle_servers';
  }

  get apiVersion() {
    return skylineBase();
  }

  get responseKey() {
    return 'recycle_server';
  }

  get mapper() {
    return (item) => ({
      ...item,
      reclaim_timestamp: item.reclaim_timestamp * 1000,
    });
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_keys = sortKey;
      params.sort_dirs = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };
}

const globalRecycleBinStore = new RecycleBinStore();
export default globalRecycleBinStore;
