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

import { isEmpty, isNumber } from 'lodash';

export const powerState = {
  'power on': t('Power On'),
  'power off': t('Power Off'),
  rebooting: t('Rebooting'),
  'soft rebooting': t('Soft Rebooting'),
  'soft power off': t('Soft Power Off'),
};

export const provisioningState = {
  enroll: t('Enroll'),
  manageable: t('Manageable'),
  active: t('Active'),
  available: t('Available'),
  'wait call-back': t('Deploy Wait'),
  deleting: t('Deleting'),
  deleted: t('Deleted'),
  cleaning: t('Cleaning'),
  'adopt failed': t('Adopt Failed'),
  'clean failed': t('Clean Failed'),
  inspecting: t('Inspecting'),
  'inspect failed': t('Inspect Failed'),
  'clean wait': t('Clean Wait'),
  'deploy failed': t('Deploy Failed'),
  deploying: t('Deploying'),
  error: t('Error'),
  rebuild: t('Rebuilt'),
  verifying: t('Verifying'),
};

export const canChangeStatus = (item) =>
  ['available', 'active', 'manageable', 'enroll'].indexOf(
    item.provision_state
  ) >= 0;

export const hasValue = (value) =>
  !!value || isNumber(value) || !isEmpty(value);

export const getDifFromAddSelectValue = (newValues, oldValues, name) => {
  const adds = [];
  const replaces = [];
  const dels = [];
  newValues.forEach((newItem) => {
    const { key, value } = newItem.value;
    const oldItem = oldValues.find((it) => it.value.key === key);
    const path = `/${name}/${key}`;
    const obj = {
      path,
      value,
    };
    if (!oldItem) {
      obj.op = 'add';
      adds.push(obj);
    } else if (oldItem.value.value !== value) {
      obj.op = 'replace';
      replaces.push(obj);
    }
  });
  oldValues.forEach((oldItem) => {
    const { key } = oldItem.value;
    const newItem = newValues.find((it) => it.value.key === key);
    if (!newItem) {
      const path = `/${name}/${key}`;
      dels.push({
        op: 'remove',
        path,
      });
    }
  });
  return {
    adds,
    replaces,
    dels,
  };
};
