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

import CreatePort from 'pages/compute/containers/BareMetalNode/Detail/Port/actions/Create';
import CreatePortGroup from 'pages/compute/containers/BareMetalNode/Detail/PortGroup/actions/Create';
import ManageState from './ManageState';
import PowerOn from './PowerOn';
import PowerOff from './PowerOff';
import SetMaintenance from './SetMaintenance';
import ClearMaintenance from './ClearMaintenance';
import SetBootDevice from './SetBootDevice';
import Delete from './Delete';
import Create from './Create';
import Edit from './Edit';
import Inspect from './Inspect';

const actionConfigs = {
  rowActions: {
    firstAction: ManageState,
    moreActions: [
      {
        action: Edit,
      },
      {
        action: PowerOn,
      },
      {
        action: PowerOff,
      },
      {
        action: Inspect,
      },
      {
        action: SetMaintenance,
      },
      {
        action: ClearMaintenance,
      },
      {
        action: SetBootDevice,
      },
      {
        action: CreatePort,
      },
      {
        action: CreatePortGroup,
      },
      {
        action: Delete,
      },
    ],
  },
  batchActions: [Delete],
  primaryActions: [Create],
};

export default actionConfigs;
