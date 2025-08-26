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
import globalRootStore from 'stores/root';

export const policyMap = {
  nova: ['os_compute_api'],
  ironic: ['baremetal:'],
  cinder: [
    'volume:',
    'volume_extension',
    'backup:get',
    'backup:restore',
    'scheduler_extension',
  ],
  glance: [
    'get_image',
    'add_image',
    'delete_image',
    'modify_image',
    'get_members',
    'add_member',
    'delete_member',
    'metadef',
  ],
  neutron: [
    'get_network',
    'create_network',
    'update_network',
    'delete_network',
    'get_agent',
    'delete_agent',
    'update_agent',
    'get_dhcp-agents',
    'get_l3-agents',
    'create_subnet',
    'get_subnet',
    'update_subnet',
    'delete_subnet',
    'create_port',
    'get_port',
    'update_port',
    'delete_port',
    'router',
    'policy_bandwidth_limit_rule',
    'policy_dscp_marking_rule',
    'security_group',
    'floatingip',
    'vpnservice',
    'ipsec_site_connection',
    'rbac_policy',
  ],
  octavia: ['os_load-balancer_api'],
  // keystone: ['identity:'],
  heat: ['stacks:', 'resource:index'],
  magnum: ['cluster:', 'clustertemplate:'],
  barbican: [
    'secret:get',
    'secret:decrypt',
    'secret:delete',
    'containers:post',
    'secrets:post',
    'orders:post',
  ],
  zun: ['capsule:', 'container:', 'host:get'],
  panko: ['segregation', 'telemetry:events:index'],
  manila: ['share:', 'share_', 'scheduler_stats:pools'],
  trove: [
    'instance:create',
    'instance:delete',
    'instance:update',
    'instance:backups',
    'instance:restart',
    'instance:resize',
    'instance:extension',
    'instance:guest_log_list',
    'configuration:',
    'backup:index',
    'backup:show',
  ],
};

export const convertPolicyMap = (map) => {
  const newObj = {};
  Object.entries(map).forEach(([key, value]) => {
    value.forEach((v) => {
      if (newObj[v]) {
        // eslint-disable-next-line no-console
        console.log('policy rule prefix is repeat', `${newObj[v]}:${key}`);
      }
      newObj[v] = key;
    });
  });
  return newObj;
};

export const changeToActualPolicy = (rule, map) => {
  const policies = convertPolicyMap(map);
  if (policies[rule]) {
    return `${policies[rule]}:${rule}`;
  }
  const item = Object.keys(policies).filter((key) => {
    return rule.includes(key);
  });
  if (item.length > 1) {
    item.forEach((key) => {
      // eslint-disable-next-line no-console
      console.log(
        'policy rule prefix is conflict or repeat',
        `${policies[key]}:${rule}`
      );
    });
  }
  const prefix = item.length && policies[item[0]];
  return prefix ? `${prefix}:${rule}` : rule;
};

export const checkPolicyRule = (rule, actionName, isAliasPolicy) => {
  if (!rule) {
    return true;
  }
  const actualRule = isAliasPolicy
    ? rule
    : changeToActualPolicy(rule, policyMap);
  const item = globalRootStore.policies.find((it) => it.rule === actualRule);
  if (!item) {
    // eslint-disable-next-line no-console
    console.log('policy rule not exit', actualRule, actionName);
  }
  return item ? item.allowed : true;
};

const checkPolicyRules = (rules, every, actionName, isAliasPolicy) => {
  if (rules.length === 0) {
    return true;
  }
  if (every) {
    return rules.every((rule) =>
      checkPolicyRule(rule, actionName, isAliasPolicy)
    );
  }
  return rules.some((rule) => checkPolicyRule(rule, actionName, isAliasPolicy));
};

export const systemRoleIsReader = () => {
  const { roles = [] } = globalRootStore.user || {};
  const readerRole = 'reader';
  const adminRoles = ['admin'];
  const hasReaderRole = roles.some((it) => it.name === readerRole);
  if (!hasReaderRole) {
    return false;
  }
  const hasAdminRole = roles.some((it) => adminRoles.includes(it.name));
  return hasReaderRole && !hasAdminRole;
};

const checkItemPolicy = ({
  policy,
  aliasPolicy,
  item,
  actionName,
  isAdminPage,
  enableSystemReader,
}) => {
  if (globalRootStore.policies.length === 0) {
    return false;
  }
  if (isAdminPage && !enableSystemReader && systemRoleIsReader()) {
    return false;
  }
  if (isAdminPage && !enableSystemReader && systemRoleIsReader()) {
    return false;
  }
  if (!policy && !aliasPolicy) {
    // eslint-disable-next-line no-console
    console.log('has no policy', policy, item, actionName);
    return true;
  }
  const usePolicy = aliasPolicy || policy;
  const itemPolicy = isFunction(usePolicy) ? usePolicy(item) : usePolicy;
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
    console.log('has no rules', usePolicy, item, actionName, rules);
    return true;
  }
  return checkPolicyRules(rules, every, actionName, !!aliasPolicy);
};

export default checkItemPolicy;

export const allCanReadPolicy = {
  rules: ['admin', 'reader', 'member'],
  every: false,
};

export const allCanChangePolicy = {
  rules: ['admin', 'member'],
  every: false,
};

export const onlyAdminCanReadPolicy = {
  rules: ['admin', 'reader'],
  every: false,
};

export const onlyAdminCanChangePolicy = {
  rules: ['admin'],
  every: false,
};

export const checkSystemAdmin = () => {
  return globalRootStore.hasAdminRole;
};
