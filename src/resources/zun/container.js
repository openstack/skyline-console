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

export const containerStatus = {
  Creating: t('Creating'),
  Created: t('Created'),
  Running: t('Running'),
  Stopped: t('Stopped'),
  Paused: t('Paused'),
  Restarting: t('Restarting'),
  Deleting: t('Deleting'),
  Error: t('Error'),
  Unknown: t('Unknown'),
  Rebuilding: t('Rebuilding'),
};

export const containerTaskStatus = {
  free: t('No Task'),
  container_creating: t('Container Creating'),
  container_starting: t('Container Starting'),
  container_stopping: t('Container Stopping'),
  container_rebooting: t('Container Rebooting'),
  container_deleting: t('Container Deleting'),
  container_rebuilding: t('Container Rebuilding'),
  container_killing: t('Container Killing'),
  container_pausing: t('Container Pausing'),
  container_unpausing: t('Container Unpausing'),
  container_restarting: t('Container Restarting'),
  image_pulling: t('Image Pulling'),
  sg_adding: t('Security Groups Adding'),
  sg_removing: t('Security Groups Removing'),
  network_attaching: t('Network Attaching'),
  network_detaching: t('Network Detaching'),
};

const states = {
  ERROR: 'Error',
  RUNNING: 'Running',
  STOPPED: 'Stopped',
  PAUSED: 'Paused',
  UNKNOWN: 'Unknown',
  CREATING: 'Creating',
  CREATED: 'Created',
  DELETED: 'Deleted',
  DELETING: 'Deleting',
  REBUILDING: 'Rebuilding',
  DEAD: 'Dead',
  RESTARTING: 'Restarting',
};

const validStates = {
  update: [states.CREATED, states.RUNNING, states.STOPPED, states.PAUSED],
  start: [states.CREATED, states.STOPPED, states.ERROR],
  stop: [states.RUNNING],
  reboot: [states.CREATED, states.RUNNING, states.STOPPED, states.ERROR],
  rebuild: [states.CREATED, states.RUNNING, states.STOPPED, states.ERROR],
  pause: [states.RUNNING],
  unpause: [states.PAUSED],
  execute: [states.RUNNING],
  kill: [states.RUNNING],
  delete: [
    states.CREATED,
    states.ERROR,
    states.STOPPED,
    states.DELETED,
    states.DEAD,
  ],
  delete_force: [
    states.CREATED,
    states.CREATING,
    states.ERROR,
    states.RUNNING,
    states.STOPPED,
    states.UNKNOWN,
    states.DELETED,
    states.DEAD,
    states.RESTARTING,
    states.REBUILDING,
    states.DELETING,
  ],
  delete_stop: [
    states.RUNNING,
    states.CREATED,
    states.ERROR,
    states.STOPPED,
    states.DELETED,
    states.DEAD,
  ],
  manage_security_groups: [
    states.CREATED,
    states.RUNNING,
    states.STOPPED,
    states.PAUSED,
  ],
  network_attach_detach: [
    states.CREATED,
    states.RUNNING,
    states.STOPPED,
    states.PAUSED,
  ],
};

export const checkItemAction = (item, actionName) => {
  if (!item) return false;
  const { status } = item;
  return validStates[actionName].includes(status);
};

export const imageDrivers = {
  docker: t('Docker Hub'),
  glance: t('Glance Image'),
};

export const exitPolicies = {
  no: t('No'),
  'on-failure': t('On failure'),
  always: t('Always'),
  'unless-stopped': t('Unless Stopped'),
};
