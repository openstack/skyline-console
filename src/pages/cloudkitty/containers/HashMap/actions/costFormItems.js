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

import { mappingTypeOptions } from 'resources/cloudkitty/rating';

const typeFormItem = {
  name: 'type',
  label: t('Type'),
  type: 'select',
  options: mappingTypeOptions,
  required: true,
  tip: t('Flat applies a fixed cost; Rate multiplies the current cost.'),
};

const costFormItem = {
  name: 'cost',
  label: t('Cost'),
  type: 'input-number',
  required: true,
  step: 0.00001,
};

// Shared by the mapping create/edit modals.
export const mappingFormItems = [
  {
    name: 'value',
    label: t('Value'),
    type: 'input',
    tip: t('Leave empty to apply the mapping to every value (the default).'),
  },
  costFormItem,
  typeFormItem,
];

// Shared by the threshold create/edit modals.
export const thresholdFormItems = [
  {
    name: 'level',
    label: t('Level'),
    type: 'input-number',
    required: true,
    step: 0.00001,
    tip: t('The quantity threshold at which this cost starts to apply.'),
  },
  costFormItem,
  typeFormItem,
];
