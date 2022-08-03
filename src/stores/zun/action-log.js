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

import Base from 'stores/base';
import client from 'client';

export class ActionsLogStore extends Base {
  get client() {
    return client.zun.containers.actions;
  }

  get isSubResource() {
    return true;
  }

  get paramsFunc() {
    return () => {};
  }

  get mapper() {
    return (data) => ({
      ...data,
      id: data.request_id,
    });
  }

  detailFetchByClient(resourceParams) {
    const { id, requestId } = resourceParams;
    return this.client.show(id, requestId);
  }
}

const globalActionsLogStore = new ActionsLogStore();
export default globalActionsLogStore;
