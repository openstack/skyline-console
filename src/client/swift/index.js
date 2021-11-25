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

class SwiftClient extends Base {
  get baseUrl() {
    return swiftBase();
  }

  get checkNameCode() {
    return {
      200: 'container exists',
      401: 'user not login',
      403: 'not allow to access this container',
      404: 'not found this container',
      500: 'other exception',
    };
  }

  get checkNameCodeObject() {
    return {
      200: 'container exists',
      401: 'user not login',
      403: 'not allow to access this container',
      404: 'not found this container',
      500: 'other exception',
    };
  }

  get projectInUrl() {
    return true;
  }

  getUrl = (url) => {
    const prefix = `${this.baseUrl}/AUTH_${this.project}`;
    return url ? `${prefix}/${url}` : prefix;
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
              return this.request.put(encodeURIComponent(name));
            },
          },
          {
            key: 'showMetadata',
            generate: (name) => {
              return this.request.head(encodeURIComponent(name));
            },
          },
          {
            key: 'updateMetadata',
            generate: (name, headers) => {
              return this.request.post(encodeURIComponent(name), null, null, {
                headers,
              });
            },
          },
          {
            key: 'uploadFile',
            generate: (container, name, content, conf) => {
              const url = `${encodeURIComponent(
                container
              )}/${encodeURIComponent(name)}`;
              return this.request.put(url, content, null, conf);
            },
          },
          {
            key: 'createFolder',
            generate: (container, name) => {
              const url = `${encodeURIComponent(
                container
              )}/${encodeURIComponent(name)}`;
              return this.request.put(url);
            },
          },
          {
            key: 'showObjectMetadata',
            generate: (container, objectName) => {
              const url = `${encodeURIComponent(
                container
              )}/${encodeURIComponent(objectName)}`;
              return this.request.head(url);
            },
          },
          {
            key: 'copy',
            generate: (fromContaier, fromName, toContainer, toName) => {
              const url = `${fromContaier}/${fromName}`;
              const headers = {
                Destination: encodeURIComponent(`${toContainer}/${toName}`),
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
