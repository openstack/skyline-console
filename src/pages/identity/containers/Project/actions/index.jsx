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

import deleteActionConfig from './Delete';
import editActionConfig from './Edit';
import enableActionConfig from './Enable';
import forbiddenActionConfig from './Forbidden';
import createActionConfig from './Create';
import userActionConfig from './UserManager';
import userGroupActionConfig from './UserGroupManager';
import quotaActionConfig from './QuotaManager';
import ModifyTags from './ModifyTags';

const actionConfigs = {
  rowActions: {
    firstAction: editActionConfig,
    moreActions: [
      {
        action: deleteActionConfig,
      },
      {
        action: quotaActionConfig,
      },
      {
        action: userActionConfig,
      },
      {
        action: userGroupActionConfig,
      },
      {
        action: enableActionConfig,
      },
      {
        action: forbiddenActionConfig,
      },
      {
        action: ModifyTags,
      },
    ],
  },
  batchActions: [deleteActionConfig],
  primaryActions: [createActionConfig],
};

export default actionConfigs;
