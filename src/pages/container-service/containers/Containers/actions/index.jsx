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
import CreateStep from './StepCreate';
import DeleteContainer from './Delete';
import PauseContainer from './Pause';
import RebootContainer from './Reboot';
import StartContainer from './Start';
import StopContainer from './Stop';
import UnpauseContainer from './Unpause';
import RebuildContainer from './Rebuild';
import EditContainer from './Edit';
import KillContainer from './Kill';
import ForceDeleteContainer from './ForceDelete';
import ExecuteCommandContainer from './ExecuteCommand';
import AttachNetwork from './AttachNetwork';
import DetachNetwork from './DetachNetwork';

const statusActions = [
  StartContainer,
  StopContainer,
  RebootContainer,
  KillContainer,
  RebuildContainer,
];

const resourceActions = [AttachNetwork, DetachNetwork];

const actionConfigs = {
  rowActions: {
    firstAction: DeleteContainer,
    moreActions: [
      {
        title: t('Container Status'),
        actions: [
          ...statusActions,
          PauseContainer,
          UnpauseContainer,
          ExecuteCommandContainer,
        ],
      },
      {
        title: t('Related Resources'),
        actions: resourceActions,
      },
      {
        action: EditContainer,
      },
      {
        action: ForceDeleteContainer,
      },
    ],
  },
  batchActions: [DeleteContainer],
  primaryActions: [CreateStep],
};
const actionConfigsAdmin = {
  rowActions: {
    firstAction: DeleteContainer,
    moreActions: [
      {
        title: t('Container Status'),
        actions: statusActions,
      },
      {
        action: EditContainer,
      },
      {
        action: ForceDeleteContainer,
      },
    ],
  },
  batchActions: [DeleteContainer],
  primaryActions: [],
};
export default { actionConfigs, actionConfigsAdmin };
