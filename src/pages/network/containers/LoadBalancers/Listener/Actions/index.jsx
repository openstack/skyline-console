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

import CreatePool from './CreatePool';
import DeleteAction from './DeleteListener';
import Edit from './Edit';
import EditPoolInfo from './EditPoolInfo';
import EditHealthMonitor from './EditHealthMonitor';
import CreateListener from './CreateListener';
import DeletePool from './DeletePool';

export const actionConfigs = {
  rowActions: {
    firstAction: Edit,
    moreActions: [
      {
        action: DeleteAction,
      },
      {
        action: CreatePool,
      },
      {
        action: EditPoolInfo,
      },
      {
        action: DeletePool,
      },
      {
        action: EditHealthMonitor,
      },
    ],
  },
  batchActions: [
    // DeleteAction,
  ],
  primaryActions: [CreateListener],
};

export const adminActions = {
  rowActions: {
    moreActions: [
      {
        action: DeletePool,
      },
      {
        action: DeleteAction,
      },
    ],
  },
};
