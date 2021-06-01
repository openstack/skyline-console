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

import { isArray, isObject, isFunction, isString, has } from 'lodash';

export const checkPolicyRule = (rule, actionName) => {
  if (!rule) {
    return true;
  }
  const item = globals.policies.find((it) => it.rule === rule);
  if (!item) {
    // eslint-disable-next-line no-console
    console.log('policy rule not exit', rule, actionName);
  }
  return item ? item.allowed : true;
};

const checkPolicyRules = (rules, every, actionName) => {
  if (rules.length === 0) {
    return true;
  }
  if (every) {
    return rules.every((rule) => checkPolicyRule(rule, actionName));
  }
  return rules.some((rule) => checkPolicyRule(rule, actionName));
};

const checkItemPolicy = (policy, item, actionName) => {
  if (globals.policies.length === 0) {
    // TODO: change to false
    return true;
  }
  if (!policy) {
    // eslint-disable-next-line no-console
    console.log('has no policy', policy, item, actionName);
    return true;
  }
  const itemPolicy = isFunction(policy) ? policy(item) : policy;
  let rules = [];
  let every = true;
  if (isArray(itemPolicy)) {
    rules = itemPolicy;
  } else if (isObject(itemPolicy)) {
    rules = itemPolicy.rules;
    if (has(itemPolicy, 'every')) {
      every = itemPolicy.every;
    }
  } else if (isString(itemPolicy)) {
    rules = [itemPolicy];
  }
  if (!rules) {
    // eslint-disable-next-line no-console
    console.log('has no rules', policy, item, actionName, rules);
    return true;
  }
  return checkPolicyRules(rules, every, actionName);
};

export default checkItemPolicy;

export const allCanReadPolicy = {
  rules: [
    'skyline:system_admin',
    'skyline:system_reader',
    'skyline:project_admin',
    'skyline:project_member',
    'skyline:project_reader',
  ],
  every: false,
};

export const onlyProjectCanReadPolicy = {
  rules: [
    'skyline:project_admin',
    'skyline:project_member',
    'skyline:project_reader',
  ],
  every: false,
};

export const allCanChangePolicy = {
  rules: [
    'skyline:system_admin',
    'skyline:project_admin',
    'skyline:project_member',
  ],
  every: false,
};

export const onlyProjectCanChangePolicy = {
  rules: ['skyline:project_admin', 'skyline:project_member'],
  every: false,
};

export const onlyAdminCanReadPolicy = {
  rules: ['skyline:system_admin', 'skyline:system_reader'],
  every: false,
};
