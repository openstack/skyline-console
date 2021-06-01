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

import { cinderBase } from 'utils/constants';
import { isNumber } from 'lodash';
import Base from '../base';

export class PoolStore extends Base {
  get module() {
    return 'scheduler-stats/get_pools';
  }

  get apiVersion() {
    return cinderBase();
  }

  get responseKey() {
    return 'pool';
  }

  get listFilterByProject() {
    return false;
  }

  get mapper() {
    return (data) => {
      const { name, capabilities = {} } = data;
      const newItem = { name, ...capabilities };
      const { total_capacity_gb, free_capacity_gb } = capabilities;
      if (isNumber(total_capacity_gb) && isNumber(free_capacity_gb)) {
        newItem.usedGB = (total_capacity_gb - free_capacity_gb).toFixed(2);
        newItem.usedGBPercent =
          (newItem.usedGB / total_capacity_gb).toFixed(2) * 100;
      }
      return newItem;
    };
  }

  getListUrl = () =>
    `${this.apiVersion}/${globals.user.project.id}/${this.module}?detail=true`;
}

const globalPoolStore = new PoolStore();
export default globalPoolStore;
