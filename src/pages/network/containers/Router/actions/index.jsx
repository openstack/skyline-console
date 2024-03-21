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
import Delete from './Delete';
import Edit from './Edit';
import CloseGateway from './CloseGateway';
import SetGateway from './SetGateway';
// import AssociateFip from './AssociateFip';
import ConnectSubnet from './ConnectSubnet';
import DisconnectSubnet from './DisconnectSubnet';
import EnableSnat from './EnableSnat';
import DisableSnat from './DisableSnat';
// import DisassociateFip from './DisassociateFip';

const actionConfigs = {
  rowActions: {
    firstAction: Edit,
    moreActions: [
      {
        action: ConnectSubnet,
      },
      {
        action: DisconnectSubnet,
      },
      {
        action: Delete,
      },
      {
        action: CloseGateway,
      },
      {
        action: SetGateway,
      },
      {
        action: EnableSnat,
      },
      {
        action: DisableSnat,
      },
      // {
      //   action: AssociateFip,
      // },
      // {
      //   action: DisassociateFip,
      // },
    ],
  },
  primaryActions: [Create],
  batchActions: [Delete],
};

const adminConfigs = {
  rowActions: {
    firstAction: Delete,
  },
  batchActions: [Delete],
};

export default { actionConfigs, adminConfigs };
