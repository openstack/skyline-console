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

import { get } from 'lodash';

export function baseFixToChart(value) {
  return {
    x: value[0],
    y: parseFloat(parseFloat(value[1]).toFixed(2)),
  };
}

// eslint-disable-next-line import/prefer-default-export
export function handleResponses(
  responses,
  typeKey,
  deviceKey,
  modifyKeys = []
) {
  const ret = [];
  responses.forEach((response, idx) => {
    ret.push(...handleResponse(response, typeKey, deviceKey, modifyKeys[idx]));
  });
  return ret;
}

export function handleResponse(response, typeKey, deviceKey, modifyType) {
  const { data } = response;
  const ret = [];
  data.result.forEach((result) => {
    // values for range type & value for current type
    const values =
      result.values || result.value.some(Array.isArray)
        ? result.value
        : [result.value] || [];
    values.forEach((value) => {
      const item = {
        ...baseFixToChart(value),
      };
      if (typeKey) {
        item.type = get(result.metric, typeKey);
      }
      if (deviceKey) {
        item.device = get(result.metric, deviceKey);
      }
      if (modifyType) {
        item.type = modifyType;
      }
      ret.push(item);
    });
  });
  return ret;
}
