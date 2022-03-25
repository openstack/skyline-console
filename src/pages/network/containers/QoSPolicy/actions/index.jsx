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
import Edit from './Edit';
import DeleteAction from './Delete';
import CreateBandwidthLimitRule from './CreateBandwidthLimitRule';
import CreateDSCPMarkingRules from './CreateDSCPMarkingRules';
import DeleteDSCPMarkingRules from './DeleteDSCPMarkingRules';
import DeleteBandwidthEgressRules from './DeleteBandwidthEgressRules';
import DeleteBandwidthIngressRules from './DeleteBandwidthIngressRules';
import EditBandwidthEgressRule from './EditBandwidthEgressRule';
import EditBandwidthIngressRule from './EditBandwidthIngressRule';
import EditDSCPMarkingRule from './EditDSCPMarkingRule';

const actionConfigs = {
  rowActions: {
    firstAction: Edit,
    moreActions: [
      { action: CreateBandwidthLimitRule },
      { action: EditBandwidthEgressRule },
      { action: EditBandwidthIngressRule },
      { action: DeleteBandwidthEgressRules },
      { action: DeleteBandwidthIngressRules },
      { action: CreateDSCPMarkingRules },
      { action: EditDSCPMarkingRule },
      { action: DeleteDSCPMarkingRules },
      { action: DeleteAction },
    ],
  },
  batchActions: [DeleteAction],
  primaryActions: [Create],
};

const consoleActions = {
  rowActions: {
    firstAction: Edit,
    moreActions: [
      { action: CreateBandwidthLimitRule },
      { action: EditBandwidthEgressRule },
      { action: EditBandwidthIngressRule },
      { action: DeleteBandwidthEgressRules },
      { action: DeleteBandwidthIngressRules },
      { action: DeleteAction },
    ],
  },
  batchActions: [DeleteAction],
  primaryActions: [Create],
};

export default { actionConfigs, consoleActions };
