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

import { setRouteMap, getPath } from './route-map';

describe('test route map', () => {
  const routes = [
    {
      path: '/base/overview',
      key: 'overview',
    },
    {
      path: '/compute',
      key: 'compute',
      children: [
        {
          path: '/compute/instance',
          key: 'instance',
          children: [
            {
              path: /^\/compute\/instance\/detail\/.[^/]+$/,
              key: 'instanceDetail',
              routePath: '/compute/instance/detail/:id',
            },
          ],
        },
      ],
    },
  ];

  it('setRouteMap', () => {
    const routeMap = setRouteMap(routes);
    expect(Object.keys(routeMap).length).toEqual(4);
  });

  it('getPath', () => {
    const overviewPath = getPath({ key: 'overview' });
    expect(overviewPath).toBe('/base/overview');
    const detailPath = getPath({ key: 'instanceDetail', params: { id: 1 } });
    expect(detailPath).toBe('/compute/instance/detail/1');
    const queryPath = getPath({ key: 'instance', query: { status: 'stop' } });
    expect(queryPath).toBe('/compute/instance?status=stop');
  });
});
