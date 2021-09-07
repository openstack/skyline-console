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

import client from 'client';
import Base from 'stores/base';

export class StackResourceStore extends Base {
  get client() {
    return client.heat.stacks;
  }

  get responseKey() {
    return 'resource';
  }

  listFetchByClient(params, originParams) {
    const { id, name } = originParams;
    return this.client.resources({ id, name }, params);
  }

  get paramsFunc() {
    return () => {};
  }
}

const globalStackResourceStore = new StackResourceStore();
export default globalStackResourceStore;
