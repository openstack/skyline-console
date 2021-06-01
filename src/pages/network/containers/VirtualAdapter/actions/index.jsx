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

import CreateAction from './Create';
import DeleteAction from './Delete';
import EditAction from './Edit';
import AttachInstance from './Attach';
import Detach from './Detach';
import ModifyQoS from './ModifyQoS';
import AssociateFIP from './AssociateFIP';
import DisAssociateFIP from './DisAssociateFIP';
import ManageSecurityGroup from './ManageSecurityGroup';

const actionConfigs = {
  rowActions: {
    firstAction: EditAction,
    moreActions: [
      {
        action: AttachInstance,
      },
      {
        action: AssociateFIP,
      },
      {
        action: DisAssociateFIP,
      },
      {
        action: Detach,
      },
      {
        action: ModifyQoS,
      },
      // {
      //   action: AddAllowedAddressPair,
      // },
      {
        action: ManageSecurityGroup,
      },
      {
        //   action: AllocateIP,
      },
      {
        action: DeleteAction,
      },
    ],
  },
  batchActions: [DeleteAction],
  primaryActions: [CreateAction],
};

const actionConfigsInDetail = {
  rowActions: {
    firstAction: Detach,
    moreActions: [
      {
        action: ModifyQoS,
      },
    ],
  },
  batchActions: [],
  primaryActions: [],
};

const noActions = {
  rowActions: {
    firstAction: null,
    moreActions: [],
  },
  batchActions: [],
  primaryActions: [],
};

const adminActions = {
  rowActions: {
    firstAction: DeleteAction,
    moreActions: [],
  },
  batchActions: [DeleteAction],
  primaryActions: [],
};

export default {
  actionConfigs,
  actionConfigsInDetail,
  noActions,
  adminActions,
};
