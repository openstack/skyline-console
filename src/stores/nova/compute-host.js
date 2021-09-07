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

export class ComputeHostStore extends Base {
  get client() {
    return client.nova.services;
  }

  listFetchByClient(params) {
    return this.skylineClient.extension.computeServices(params);
  }

  @action
  update(id, body) {
    return this.submitting(this.client.update(id, body));
  }

  @action
  disable(body) {
    const { disabled_reason, id } = body;
    const newBody = {
      status: 'disabled',
    };
    if (disabled_reason) {
      newBody.disabled_reason = disabled_reason;
    }
    return this.update(id, newBody);
  }

  @action
  enable(body) {
    const { id } = body;
    const newBody = {
      status: 'enabled',
    };
    return this.update(id, newBody);
  }
}

const globalComputeHostStore = new ComputeHostStore();
export default globalComputeHostStore;
