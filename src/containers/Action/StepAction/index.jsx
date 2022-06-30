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

import StepForm from 'components/StepForm';

export default class StepAction extends StepForm {
  static actionType = 'link';

  static buttonType = 'primary';

  static isDanger = false;

  static id = 'step-action';

  static title = 'StepAction';

  static path = '/';

  static policy = '';

  static aliasPolicy = '';

  static get allowed() {
    return Promise.resolve();
  }

  get hasConfirmStep() {
    return true;
  }
}
