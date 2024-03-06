// Copyright 2022 99cloud
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

export const clusterStatus = {
  CREATE_IN_PROGRESS: t('CREATE IN PROGRESS'),
  CREATE_COMPLETE: t('CREATE COMPLETE'),
  CREATE_FAILED: t('CREATE FAILED'),
  UPDATE_IN_PROGRESS: t('UPDATE IN PROGRESS'),
  UPDATE_COMPLETE: t('UPDATE COMPLETE'),
  UPDATE_FAILED: t('UPDATE FAILED'),
  DELETE_IN_PROGRESS: t('DELETE_IN PROGRESS'),
  DELETE_COMPLETE: t('DELETE COMPLETE'),
  DELETE_FAILED: t('DELETE FAILED'),
  RESUME_COMPLETE: t('RESUME COMPLETE'),
  RESUME_FAILED: t('RESUME FAILED'),
  RESTORE_COMPLETE: t('RESTORE COMPLETE'),
  ROLLBACK_IN_PROGRESS: t('ROLLBACK IN PROGRESS'),
  ROLLBACK_COMPLETE: t('ROLLBACK COMPLETE'),
  ROLLBACK_FAILED: t('ROLLBACK FAILED'),
  SNAPSHOT_COMPLETE: t('SNAPSHOT COMPLETE'),
  CHECK_COMPLETE: t('CHECK COMPLETE'),
  ADOPT_COMPLETE: t('ADOPT COMPLETE'),
};

export const healthStatus = {
  HEALTHY: t('HEALTHY'),
  UNHEALTHY: t('UNHEALTHY'),
  UNKNOWN: t('UNKNOWN'),
};

export const defaultTip = t(
  'If it’s not set, the value of this in the template will be used.'
);
