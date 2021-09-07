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

import { action, observable } from 'mobx';
import client from 'client';
import Base from 'stores/base';

export class StackStore extends Base {
  @observable
  template = null;

  get client() {
    return client.heat.stacks;
  }

  detailFetchByClient(resourceParams) {
    const { id, name } = resourceParams;
    return this.client.show({ id, name });
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_keys = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  get paramsFuncPage() {
    return (params) => {
      const { current, all_projects, ...rest } = params;
      const newParams = {
        ...rest,
        with_count: true,
      };
      if (all_projects) {
        newParams.global_tenant = true;
      } else {
        newParams.tenant = this.currentProjectId;
      }
      return newParams;
    };
  }

  get mapperBeforeFetchProject() {
    return (data) => ({
      project_id: data.project,
      ...data,
    });
  }

  get mapper() {
    return (data) => ({
      name: data.stack_name,
      ...data,
    });
  }

  @action
  create(body) {
    return this.submitting(this.client.create(body));
  }

  @action
  edit({ id, name }, body) {
    return this.submitting(this.client.update({ id, name }, body));
  }

  @action
  delete = ({ id, name }) => this.submitting(this.client.delete({ id, name }));

  @action
  abandon = ({ id, name }) => {
    return this.submitting(this.client.abandon({ id, name }));
  };

  @action
  getTemplate = async ({ id, name }) => {
    const result = await this.client.template({ id, name });
    this.template = result;
  };
}

const globalStackStore = new StackStore();
export default globalStackStore;
