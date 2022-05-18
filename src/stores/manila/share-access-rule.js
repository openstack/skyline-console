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
import { isEmpty } from 'lodash';

export class ShareAccessRuleStore extends Base {
  get client() {
    return client.manila.shareAccessRules;
  }

  get shareClient() {
    return client.manila.shares;
  }

  get listResponseKey() {
    return this.responseKey;
  }

  get paramsFunc() {
    return (params) => {
      const { id, keywords, ...rest } = params;
      return {
        ...rest,
        share_id: id,
      };
    };
  }

  @action
  update(id, data) {
    const body = {};
    body[this.responseKey] = data;
    return this.submitting(this.client.update(id, body));
  }

  @action
  create(id, data) {
    const body = {
      allow_access: data,
    };
    return this.submitting(this.shareClient.action(id, body));
  }

  @action
  delete = (id, accessId) => {
    const body = {
      deny_access: {
        access_id: accessId,
      },
    };
    return this.submitting(this.shareClient.action(id, body));
  };

  @action
  manageMetadata = async (id, updates, dels) => {
    if (!isEmpty(updates)) {
      await this.client.updateMetadata(id, {
        metadata: updates,
      });
    }
    const delReqs = dels.map((key) => {
      return this.client.metadata.delete(id, key);
    });
    return this.submitting(Promise.all(delReqs));
  };
}

const globalShareAccessRuleStore = new ShareAccessRuleStore();
export default globalShareAccessRuleStore;
