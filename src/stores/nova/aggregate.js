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

import { novaBase } from 'utils/constants';
import { action } from 'mobx';
import Base from '../base';

export class AggregateStore extends Base {
  get module() {
    return 'os-aggregates';
  }

  get apiVersion() {
    return novaBase();
  }

  get responseKey() {
    return 'aggregate';
  }

  @action
  manageHost({ adds, dels, id }) {
    const url = `${this.getListUrl()}/${id}/action`;
    const bodys = [];
    adds.forEach((it) => {
      const body = {
        add_host: {
          host: it,
        },
      };
      bodys.push(body);
    });
    dels.forEach((it) => {
      const body = {
        remove_host: {
          host: it,
        },
      };
      bodys.push(body);
    });
    return this.submitting(
      Promise.all(bodys.map((it) => request.post(url, it)))
    );
  }

  @action
  manageMetadata({ id, metadatas }) {
    const url = `${this.getListUrl()}/${id}/action`;
    const body = {
      set_metadata: {
        metadata: metadatas,
      },
    };
    return this.submitting(request.post(url, body));
  }
}

const globalAggregateStore = new AggregateStore();
export default globalAggregateStore;
