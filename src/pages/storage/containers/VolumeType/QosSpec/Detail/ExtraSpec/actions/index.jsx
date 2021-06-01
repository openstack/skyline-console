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

import createActionConfig from './Create';
import editActionConfig from './Edit';
import deleteActionConfig from './Delete';

const actionConfigs = {
  rowActions: {
    firstAction: deleteActionConfig,
    moreActions: [
      {
        action: editActionConfig,
      },
    ],
  },
  batchActions: [deleteActionConfig],
  primaryActions: [createActionConfig],
};

export default actionConfigs;
