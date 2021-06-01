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

import checkItemPolicy from 'resources/policy';

export async function checkAllowed(
  item,
  policy,
  allowed,
  containerProps,
  actionName,
  extra
) {
  const policyResult = checkItemPolicy(policy, item, actionName, extra);
  if (!policyResult) {
    return false;
  }
  let result = false;
  if (allowed) {
    result = allowed(item, containerProps, extra);
    if (result instanceof Promise) {
      result = await result;
    }
  }
  return result;
}

export async function getAllowedResults(
  actions,
  data,
  key,
  containerProps,
  extra
) {
  const allowedPromises = actions.map(async (it) => {
    const result = checkAllowed(
      data,
      key ? it[key].policy : it.policy,
      key ? it[key].allowed : it.allowed,
      containerProps,
      key ? it[key].title : it.title,
      extra
    );
    return result;
  });
  const results = await Promise.all(allowedPromises);
  return results;
}

export function getPolicyResults(actions, extra) {
  return actions.map((it) => {
    const { policy, title } = it;
    const result = checkItemPolicy(policy, null, title, extra);
    return result;
  });
}

export function getAction(action, item, containerProps) {
  const { actionType } = action;
  if (actionType === 'confirm') {
    const Action = action;
    const actionIns = new Action({ item, containerProps });
    return actionIns;
  }
  return action;
}

export function getActionsByPolicy(actions, containerProps) {
  const actionList = actions.map((action) =>
    getAction(action, null, containerProps)
  );
  const policyResults = getPolicyResults(actionList);
  return actionList.filter((it, index) => policyResults[index]);
}
