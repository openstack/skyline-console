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

import Create from './Create';
import Edit from './Edit';
import Delete from './Delete';
import Restore from './Restore';
import Attach from './Attach';
import Detach from './Detach';
import CreateSnapshot from './CreateSnapshot';
import ExtendVolume from './ExtendVolume';
import ChangeType from './ChangeType';
import CloneVolume from './CloneVolume';
import CreateBackup from './CreateBackup';
import UpdateStatus from './UpdateStatus';
import Migrate from './Migrate';
import CreateImage from './CreateImage';
import AcceptVolumeTransfer from './AcceptVolumeTransfer';
import CreateTransfer from './CreateTransfer';
import CancelTransfer from './CancelTransfer';
import CreateInstance from './CreateInstance';
import Bootable from './Bootable';

const dataProtectionActions = {
  title: t('Data Protection'),
  actions: [CreateSnapshot, CreateBackup, CreateImage, CloneVolume, Restore],
};

const instanceRelated = {
  title: t('Instance Related'),
  actions: [Bootable, CreateInstance, Attach, Detach],
};

const capacityAndSize = {
  title: t('Capacity & Type'),
  actions: [ExtendVolume, ChangeType],
};

const actionConfigs = {
  rowActions: {
    firstAction: Edit,
    moreActions: [
      dataProtectionActions,
      instanceRelated,
      capacityAndSize,
      {
        action: Delete,
      },
      {
        action: CreateTransfer,
      },
      {
        action: CancelTransfer,
      },
    ],
  },
  batchActions: [Delete],
  primaryActions: [Create, AcceptVolumeTransfer],
};

const instanceDetailConfig = {
  rowActions: {
    firstAction: Edit,
    moreActions: [
      dataProtectionActions,
      instanceRelated,
      capacityAndSize,
      {
        action: Delete,
      },
      {
        action: CreateTransfer,
      },
      {
        action: CancelTransfer,
      },
    ],
  },
  batchActions: [],
  primaryActions: [],
};

const adminConfig = {
  rowActions: {
    firstAction: Delete,
    moreActions: [
      {
        action: UpdateStatus,
      },
      {
        action: Migrate,
      },
    ],
  },
  batchActions: [Delete],
  primaryActions: [],
};

const instanceDetailAdminConfig = {
  rowActions: {
    firstAction: UpdateStatus,
    moreActions: [
      {
        action: Migrate,
      },
    ],
  },
  batchActions: [],
  primaryActions: [],
};

export default {
  actionConfigs,
  adminConfig,
  instanceDetailConfig,
  instanceDetailAdminConfig,
};
