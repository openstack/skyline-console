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

import { emptyActionConfig } from 'utils/constants';
import Allocate from './Allocate';
import Associate from './Associate';
import Release from './Release';
import Disassociate from './Disassociate';
import Edit from './Edit';
import CreatePortForwarding from '../Detail/PortForwarding/actions/Create';

const rowActions = {
  firstAction: Edit,
  moreActions: [
    {
      action: Associate,
    },
    {
      action: Disassociate,
    },
    {
      action: CreatePortForwarding,
    },
    {
      action: Release,
    },
  ],
};

const actionConfigs = {
  rowActions,
  batchActions: [Release],
  primaryActions: [Allocate],
};

const adminConfigs = {
  rowActions: {
    firstAction: Release,
  },
  batchActions: [Release],
  primaryActions: [Allocate],
};

const instanceDetailConfigs = {
  rowActions: {
    firstAction: Disassociate,
  },
};

const instanceDetailAdminConfigs = emptyActionConfig;

const qosDetailConfigs = {
  rowActions,
};

const qosDetailAdminConfigs = {
  rowActions: {
    firstAction: Release,
  },
};

export default {
  actionConfigs,
  adminConfigs,
  instanceDetailConfigs,
  instanceDetailAdminConfigs,
  qosDetailConfigs,
  qosDetailAdminConfigs,
};
