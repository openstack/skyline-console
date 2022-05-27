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

import Base from '../client/base';
import { glanceBase } from '../client/constants';

export class GlanceClient extends Base {
  get baseUrl() {
    return glanceBase();
  }

  get resources() {
    return [
      {
        key: 'images',
        responseKey: 'image',
        extendOperations: [
          {
            key: 'count',
            isDetail: false,
          },
          {
            key: 'uploadFile',
            generate: (id, body, conf = {}) => {
              return this.request.put(
                `${this.getDetailUrl('images', id)}/file`,
                body,
                null,
                {
                  headers: {
                    'content-type': 'application/octet-stream',
                  },
                  ...conf,
                }
              );
            },
          },
          {
            key: 'patch',
            generate: (id, data) =>
              this.request.patch(this.getDetailUrl('images', id), data, null, {
                headers: {
                  'content-type':
                    'application/openstack-images-v2.1-json-patch',
                },
              }),
          },
          {
            key: 'import',
            method: 'post',
            isDetail: true,
          },
        ],
        subResources: [
          {
            key: 'members',
          },
        ],
      },
      {
        name: 'namespaces',
        key: 'metadefs/namespaces',
        responseKey: 'namespace',
        subResources: [
          {
            name: 'resourceTypes',
            key: 'resource_types',
          },
        ],
      },
      {
        name: 'resourceTypes',
        key: 'metadefs/resource_types',
        responseKey: 'resource_type',
      },
    ];
  }
}

const glanceClient = new GlanceClient();
export default glanceClient;
