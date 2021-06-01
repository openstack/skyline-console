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
import { heatBase } from 'utils/constants';
import Base from '../base';

export class StackStore extends Base {
  @observable
  template = {};

  get module() {
    if (!globals.user) {
      return null;
    }
    return `${globals.user.project.id}/stacks`;
  }

  get apiVersion() {
    return heatBase();
  }

  get responseKey() {
    return 'stack';
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_keys = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  getDetailUrl = ({ id, name }) => `${this.getListUrl()}/${name}/${id}`;

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
        newParams.tenant = globals.user.project.id;
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
    return this.submitting(request.post(this.getListUrl(), body));
  }

  @action
  edit({ id, name }, body) {
    return this.submitting(request.put(this.getDetailUrl({ id, name }), body));
  }

  @action
  delete = ({ id, name }) =>
    this.submitting(request.delete(this.getDetailUrl({ id, name })));

  @action
  abandon = ({ id, name }) => {
    const url = `${this.getDetailUrl({ id, name })}/abandon`;
    return this.submitting(request.delete(url));
  };

  @action
  getTemplate = async ({ id, name }) => {
    const url = `${this.getDetailUrl({ id, name })}/template`;
    const result = await request.get(url);
    this.template = result;
  };
}

const globalStackStore = new StackStore();
export default globalStackStore;
