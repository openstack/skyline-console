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

import globalRootStore from 'stores/root';
import { yesNoOptions } from 'utils/constants';
import { isBoolean } from 'lodash';

export const firewallStatus = {
  ACTIVE: t('Active'),
  DOWN: t('Down'),
  ERROR: t('Error'),
  CREATED: t('Created'),
  PENDING_CREATE: t('Pending Create'),
  PENDING_UPDATE: t('Pending Update'),
  PENDING_DELETE: t('Pending Delete'),
  INACTIVE: t('Inactive'),
};

export const adminState = {
  true: t('Up'),
  false: t('Down'),
};

export const transitionStatus = [
  'PENDING_CREATE',
  // 'PENDING_UPDATE',
  'PENDING_DELETE',
];

export const isDefault = (item) => item.name === 'default';

export const isMine = (item) => item.project_id === globalRootStore.projectId;

export const hasNoProject = (item) =>
  !item.project_name || item.project_name === '-';

export const getDefaultFilter = (name) => {
  const options = yesNoOptions.map((it) => {
    if (it.key) {
      return {
        ...it,
        checkLabel: name,
        isQuick: true,
      };
    }
    return it;
  });
  return {
    label: name,
    name: 'notDefault',
    options,
    filterFunc: (record, value) => {
      if (isBoolean(value)) {
        return value ? record : true;
      }
      return value === 'true' ? record : true;
    },
  };
};
