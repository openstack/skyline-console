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

import { ConfirmAction } from 'containers/Action';
import globalClaimStore from 'stores/zaqar/claim';

export default class ReleaseClaimAction extends ConfirmAction {
  get id() {
    return 'release-claim';
  }

  get title() {
    return t('Release Claim');
  }

  get isDanger() {
    return true;
  }

  get buttonText() {
    return t('Release');
  }

  get actionName() {
    return t('Release claim');
  }

  policy = 'claims:delete';

  allowed = () => Promise.resolve(true);

  getItemName = (item) => item.claimId || item.id || '';

  // item here is { claimId, queueName } passed from the Claim tab
  onSubmit = (item) =>
    globalClaimStore.releaseClaim(item.queueName, item.claimId);
}
