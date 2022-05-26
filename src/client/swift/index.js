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
import { swiftBase } from '../client/constants';

export class SwiftClient extends Base {
  get baseUrl() {
    return swiftBase();
  }

  get projectInUrl() {
    return true;
  }

  getUrl = (url) => {
    const prefix = `${this.baseUrl}/AUTH_${this.project}`;
    return url ? `${prefix}/${url}` : prefix;
  };

  getEncodeUrl = (url) => {
    const tmp = url.split('/');
    return tmp.map((t) => encodeURIComponent(t)).join('/');
  };

  get resources() {
    return [
      {
        name: 'container',
        key: '',
        extendOperations: [
          {
            key: 'url',
            generate: (name) => {
              return this.getUrl(name);
            },
          },
          {
            key: 'create',
            generate: (name) => {
              return this.request.put(this.getEncodeUrl(name));
            },
          },
          {
            key: 'showMetadata',
            generate: (name) => {
              return this.request.head(this.getEncodeUrl(name));
            },
          },
          {
            key: 'updateMetadata',
            generate: (name, headers) => {
              return this.request.post(this.getEncodeUrl(name), null, null, {
                headers,
              });
            },
          },
          {
            key: 'uploadFile',
            generate: (container, name, content, conf) => {
              const url = this.getEncodeUrl(`${container}/${name}`);
              return this.request.put(url, content, null, conf);
            },
          },
          {
            key: 'createFolder',
            generate: (container, name) => {
              const url = this.getEncodeUrl(`${container}/${name}`);
              return this.request.put(url);
            },
          },
          {
            key: 'showObjectMetadata',
            generate: (container, objectName) => {
              const url = this.getEncodeUrl(`${container}/${objectName}`);
              return this.request.head(url);
            },
          },
          {
            key: 'copy',
            generate: (fromContainer, fromName, toContainer, toName) => {
              const url = `${fromContainer}/${fromName}`;
              const headers = {
                Destination: this.getEncodeUrl(`${toContainer}/${toName}`),
              };
              return this.request.copy(url, null, { headers });
            },
          },
        ],
        subResources: [
          {
            key: '',
            name: 'object',
          },
        ],
      },
    ];
  }
}

const swiftClient = new SwiftClient();
export default swiftClient;
