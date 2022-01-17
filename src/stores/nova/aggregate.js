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

export class AggregateStore extends Base {
  get client() {
    return client.nova.aggregates;
  }

  @action
  manageHost({ adds, dels, id }) {
    const items = [];
    adds.forEach((it) => {
      const item = {
        add_host: {
          host: it,
        },
      };
      items.push(item);
    });
    dels.forEach((it) => {
      const item = {
        remove_host: {
          host: it,
        },
      };
      items.push(item);
    });
    return this.submitting(
      Promise.all(items.map((it) => this.client.action(id, it)))
    );
  }

  @action
  manageMetadata({ id, metadata }) {
    const body = {
      set_metadata: {
        metadata,
      },
    };
    return this.submitting(this.client.action(id, body));
  }
}

const globalAggregateStore = new AggregateStore();
export default globalAggregateStore;
