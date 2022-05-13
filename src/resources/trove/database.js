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

import { instanceStatus } from 'resources/nova/instance';

export const InstanceStatus = {
  ...instanceStatus,
  BUILD: t('Building'),
  ACTIVE: t('Active'),
  ERROR: t('Error'),
  DELETE: t('Delete'),
  MIGRATE: t('Migrate'),
  RESIZE: t('Resize'),
  REBOOT: t('Reboot'),
  PROMOTE: t('Promote'),
  EJECT: t('Eject'),
};

export { default as policyType } from '../nova/server-group';
