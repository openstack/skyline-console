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

export default class DNSBaseStore extends Base {
  get paramsFuncPage() {
    return (params) => {
      const { current, all_projects, ...rest } = params;
      return rest;
    };
  }

  updateParamsSortPage = (params, sortKey, sortOrder) => {
    if (sortKey && sortOrder) {
      params.sort_key = sortKey;
      params.sort_dir = sortOrder === 'descend' ? 'desc' : 'asc';
    }
  };

  listFetchByClient(params, originParams) {
    const { all_projects = false } = originParams;

    const config = {
      headers: {
        'x-auth-all-projects': all_projects,
      },
    };
    if (!this.isSubResource) {
      return this.client.list(params, config);
    }
    const fatherId = this.getFatherResourceId(originParams);
    console.log('originParams', originParams);
    return this.client.list(fatherId, params, config);
  }

  detailFetchByClient(resourceParams, detailParams, originParams) {
    const { id } = resourceParams;
    const { all_projects = false } = originParams;
    const config = {
      headers: {
        'x-auth-all-projects': all_projects,
      },
    };
    if (!this.isSubResource) {
      return this.client.show(id, detailParams, config);
    }
    const fatherId = this.getFatherResourceId(resourceParams);
    return this.client.show(fatherId, id, detailParams, config);
  }

  async getCountForPage(newParams, newData, allProjects, result) {
    const { metadata = {} } = result;
    const { total_count = 0 } = metadata || {};
    const total = total_count;
    return {
      total,
      count: total,
    };
  }
}
