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

import Delete from './Delete';
import Edit from './Edit';
import Enable from './Enable';
import Forbidden from './Forbidden';
import Create from './Create';
import ManageUser from './ManageUser';
import ManageUserGroup from './ManageUserGroup';
import ManageQuota from './ManageQuota';
import ModifyTags from './ModifyTags';
import SetDefaultProject from './SetDefaultProject';
import RemoveDefaultProject from './RemoveDefaultProject';

const actionConfigs = {
  rowActions: {
    firstAction: Edit,
    moreActions: [
      {
        action: Delete,
      },
      {
        action: ManageQuota,
      },
      {
        action: ManageUser,
      },
      {
        action: ManageUserGroup,
      },
      {
        action: Enable,
      },
      {
        action: Forbidden,
      },
      {
        action: ModifyTags,
      },
    ],
  },
  batchActions: [Delete],
  primaryActions: [Create],
};

export const actionConfigsInUserDetail = {
  rowActions: {
    firstAction: null,
    moreActions: [
      {
        action: SetDefaultProject,
      },
    ],
  },
  primaryActions: [RemoveDefaultProject],
};

export default actionConfigs;
