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

import checkItemPolicy, { systemRoleIsReader } from 'resources/skyline/policy';

export async function checkAllowed({
  item,
  policy,
  aliasPolicy,
  allowed,
  allowedExtra,
  containerProps,
  actionName,
  extra,
  isAdminPage,
  action,
}) {
  const { enableSystemReader } = action || {};
  const policyResult = checkItemPolicy({
    policy,
    aliasPolicy,
    item,
    actionName,
    isAdminPage,
    enableSystemReader,
  });
  if (!policyResult) {
    return false;
  }
  let result = false;
  let allowedExtraResult = true;
  if (allowedExtra) {
    allowedExtraResult = allowedExtra({ item, containerProps, extra, action });
    if (allowedExtraResult instanceof Promise) {
      allowedExtraResult = await allowedExtraResult;
    }
  }
  if (!allowedExtraResult) {
    return false;
  }
  if (allowed) {
    result = allowed(item, containerProps, extra);
    if (result instanceof Promise) {
      result = await result;
    }
  }
  return result;
}

export async function getAllowedResults({
  actions,
  data,
  key,
  containerProps,
  extra,
  isAdminPage,
}) {
  const allowedPromises = actions.map(async (it) => {
    const result = checkAllowed({
      item: data,
      policy: key ? it[key].policy : it.policy,
      aliasPolicy: key ? it[key].aliasPolicy : it.aliasPolicy,
      allowed: key ? it[key].allowed : it.allowed,
      allowedExtra: key ? it[key].allowedExtra : it.allowedExtra,
      containerProps,
      actionName: key ? it[key].title : it.title,
      extra,
      isAdminPage,
      action: it.action,
    });
    return result;
  });
  const results = await Promise.all(allowedPromises);
  return results;
}

export function getPolicyResults({ actions, extra, isAdminPage }) {
  return actions.map((it) => {
    const { policy, aliasPolicy, title, enableSystemReader } = it;
    if (isAdminPage && !enableSystemReader && systemRoleIsReader()) {
      return false;
    }
    const result = checkItemPolicy({
      policy,
      aliasPolicy,
      actionName: title,
      extra,
    });
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

export function getActionsByPolicy({ actions, containerProps, isAdminPage }) {
  const actionList = actions.map((action) =>
    getAction(action, null, containerProps)
  );
  const policyResults = getPolicyResults({ actions: actionList, isAdminPage });
  return actionList.filter((it, index) => policyResults[index]);
}
