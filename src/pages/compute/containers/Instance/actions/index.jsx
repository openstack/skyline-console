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

import SoftDelete from './SoftDelete';
// import CreateImage from './CreateImage';
import CreateSnapshot from './CreateSnapshot';
import AttachInterface from './AttachInterface';
import StepCreateAction from './StepCreate';
import CreateIronic from './CreateIronic';
import ChangePassword from './ChangePassword';
import StartAction from './Start';
import StopAction from './Stop';
import DetachInterface from './DetachInterface';
import RebootAction from './Reboot';
import SoftRebootAction from './SoftReboot';
import PauseAction from './Pause';
import UnpauseAction from './Unpause';
import LockAction from './Lock';
import UnlockAction from './Unlock';
import SuspendAction from './Suspend';
import ResumeAction from './Resume';
import AttachVolume from './AttachVolume';
import DetachVolume from './DetachVolume';
import Resize from './Resize';
import MigrateAction from './Migrate';
import Console from './Console';
import Edit from './Edit';
// import Rebuild from './Rebuild';
import Rebuild from './RebuildSelect'; // Rebuild with select image
import Shelve from './Shelve';
import Unshelve from './Unshelve';
import DisassociateFip from './DisassociateFip';
import LiveMigrate from './LiveMigrate';
import AssociateFip from './AssociateFip';
import ManageSecurityGroup from './ManageSecurityGroup';
import DeleteIronic from './DeleteIronic';
import ConfirmResize from './ConfirmResize';
import RevertResize from './RevertResize';
import ModifyTags from './ModifyTags';
import { Monitor } from './Monitor';

const statusActions = [
  StartAction,
  StopAction,
  LockAction,
  UnlockAction,
  RebootAction,
  SoftRebootAction,
  SuspendAction,
  ResumeAction,
  PauseAction,
  UnpauseAction,
  Shelve,
  Unshelve,
];

const resourceActions = [
  AttachInterface,
  DetachInterface,
  AttachVolume,
  DetachVolume,
  AssociateFip,
  DisassociateFip,
  ManageSecurityGroup,
];

const configActions = [
  ConfirmResize,
  RevertResize,
  Resize,
  ChangePassword,
  Rebuild,
];

const batchActions = [
  StartAction,
  StopAction,
  RebootAction,
  SoftRebootAction,
  SoftDelete,
];

const batchActionsForIronic = batchActions.slice(0, -2).concat(DeleteIronic);

const batchActionsForOthers = batchActions.slice(0, -1);

const actionConfigs = {
  rowActions: {
    realFirstAction: Monitor,
    firstAction: Console,
    moreActions: [
      {
        title: t('Instance Status'),
        actions: statusActions,
      },
      // {
      //   title: t('Image & OS'),
      //   actions: [
      //     CreateImage,
      //   ],
      // },
      {
        title: t('Related Resources'),
        actions: resourceActions,
      },
      {
        title: t('Backups & Snapshots'),
        actions: [CreateSnapshot],
      },
      {
        title: t('Configuration Update'),
        actions: configActions,
      },
      {
        action: Edit,
      },
      {
        action: SoftDelete,
      },
      {
        action: DeleteIronic,
      },
      {
        action: ModifyTags,
      },
    ],
  },
  batchActions,
  primaryActions: [StepCreateAction, CreateIronic],
};

const adminActions = {
  rowActions: {
    realFirstAction: Monitor,
    firstAction: Console,
    moreActions: [
      {
        title: t('Instance Status'),
        actions: statusActions,
      },
      {
        action: MigrateAction,
      },
      {
        action: LiveMigrate,
      },
      {
        action: SoftDelete,
      },
      {
        action: DeleteIronic,
      },
      {
        action: ConfirmResize,
      },
    ],
  },
  batchActions,
  primaryActions: [],
};

export default {
  actionConfigs,
  adminActions,
  batchActions,
  batchActionsForIronic,
  batchActionsForOthers,
};
