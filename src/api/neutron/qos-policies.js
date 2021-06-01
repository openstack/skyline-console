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

import axios from '@/libs/axios';

import getNeutronBaseUrl from './base';

/**
 * Update QoS policy
 * @param {String} policyId The ID of the QoS policy.
 * @param {Object} data request body
 * @param {Object} data.policy A QoS policy object.
 * @param {String} data.policy.description A human-readable description for the resource. Default is an empty string.
 * @param {Boolean} data.policy.is_default If true, the QoS policy is the default policy.
 * @param {Boolean} data.policy.shared Set to true to share this policy with other projects. Default is false.
 * @param {String} data.policy.name Human-readable name of the resource.
 * @returns {Promise}
 */
export const updateQosPolicy = (policyId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(`qos/policies/${policyId}`),
    data,
  });

/**
 * Create bandwidth limit rule
 * @param {String} policyId The ID of the QoS policy.
 * @param {Object} data request body
 * @param {Object} data.bandwidth_limit_rule A bandwidth_limit_rule object.
 * @param {Number} data.bandwidth_limit_rule.max_kbps The maximum KBPS (kilobits per second) value.
 * @param {Number} data.bandwidth_limit_rule.max_burst_kbps The maximum burst size (in kilobits). Default is 0.
 * @param {Boolean} data.bandwidth_limit_rule.direction Valid values are egress and ingress. Default value is egress.
 * @returns {Promise}
 */
export const createBandwidthLimitRulesQosPolicy = (policyId, data) =>
  axios.request({
    method: 'post',
    url: getNeutronBaseUrl(`qos/policies/${policyId}/bandwidth_limit_rules`),
    data,
  });

/**
 * Update bandwidth limit rule
 * @param {String} policyId The ID of the QoS policy.
 * @param {Object} ruleId The ID of the QoS rule.
 * @param {Object} data request body
 * @param {Object} data.bandwidth_limit_rule A bandwidth_limit_rule object.
 * @param {Number} data.bandwidth_limit_rule.max_kbps The maximum KBPS (kilobits per second) value.
 * @param {Number} data.bandwidth_limit_rule.max_burst_kbps The maximum burst size (in kilobits). Default is 0.
 * @param {Boolean} data.bandwidth_limit_rule.direction Valid values are egress and ingress. Default value is egress.
 * @returns {Promise}
 */
export const updateBandwidthLimitRulesQosPolicy = (policyId, ruleId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(
      `qos/policies/${policyId}/bandwidth_limit_rules/${ruleId}`
    ),
    data,
  });

/**
 * Delete bandwidth limit rule
 * @param {String} policyId The ID of the QoS policy.
 * @param {Object} ruleId The ID of the QoS rule.
 * @returns {Promise}
 */
export const deleteBandwidthLimitRulesQosPolicy = (policyId, ruleId) =>
  axios.request({
    method: 'delete',
    url: getNeutronBaseUrl(
      `qos/policies/${policyId}/bandwidth_limit_rules/${ruleId}`
    ),
  });

/**
 * Create DSCP marking rule
 * @param {String} policyId The ID of the QoS policy.
 * @param {Object} data request body
 * @param {Object} data.dscp_marking_rule A dscp_marking_rule object.
 * @param {Number} data.dscp_marking_rule.dscp_mark The DSCP mark value.
 * @returns {Promise}
 */
export const createDscpMarkingRuleQosPolicy = (policyId, data) =>
  axios.request({
    method: 'post',
    url: getNeutronBaseUrl(`qos/policies/${policyId}/dscp_marking_rules`),
    data,
  });

/**
 * Update DSCP marking rule
 * @param {String} policyId The ID of the QoS policy.
 * @param {String} dscpRuleId The ID of the DSCP rule.
 * @param {Object} data request body
 * @param {Object} data.dscp_marking_rule A dscp_marking_rule object.
 * @param {Number} data.dscp_marking_rule.dscp_mark The DSCP mark value.
 * @returns {Promise}
 */
export const updateDscpMarkingRuleQosPolicy = (policyId, dscpRuleId, data) =>
  axios.request({
    method: 'put',
    url: getNeutronBaseUrl(
      `qos/policies/${policyId}/dscp_marking_rules/${dscpRuleId}`
    ),
    data,
  });

/**
 * Delete DSCP marking rule
 * @param {String} policyId The ID of the QoS policy.
 * @param {String} dscpRuleId The ID of the DSCP rule.
 * @returns {Promise}
 */
export const deleteDscpMarkingRuleQosPolicy = (policyId, dscpRuleId) =>
  axios.request({
    method: 'delete',
    url: getNeutronBaseUrl(
      `qos/policies/${policyId}/dscp_marking_rules/${dscpRuleId}`
    ),
  });

/**
 * Show QoS policy details
 * @param {String} policyId The ID of the QoS policy.
 * @returns {Promise}
 */
export const fetchQosPolicieDetailsOnNeutron = (policyId) =>
  axios.request({
    method: 'get',
    url: getNeutronBaseUrl(`qos/policies/${policyId}`),
  });
