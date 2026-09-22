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

import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalClaimStore from 'stores/zaqar/claim';

export class CreateClaim extends ModalAction {
  static id = 'create-claim';

  static title = t('Create Claim');

  static policy = 'claims:create';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = globalClaimStore;
  }

  get name() {
    return t('Create Claim');
  }

  get queueName() {
    const { match } = this.props;
    return match && match.params && match.params.id;
  }

  get formItems() {
    return [
      {
        name: 'ttl',
        label: t('TTL (seconds)'),
        type: 'input-number',
        required: false,
        min: 60,
        max: 43200,
        placeholder: t('Default: 300'),
        help: t('How long (in seconds) the claim will be valid.'),
      },
      {
        name: 'grace',
        label: t('Grace (seconds)'),
        type: 'input-number',
        required: false,
        min: 60,
        max: 43200,
        placeholder: t('Default: 60'),
        help: t(
          'Extra seconds to allow consumers to ack after a claim expires.'
        ),
      },
      {
        name: 'limit',
        label: t('Limit'),
        type: 'input-number',
        required: false,
        min: 1,
        max: 20,
        placeholder: t('Default: 5'),
        help: t('Maximum number of messages to claim (1–20).'),
      },
    ];
  }

  onSubmit = (values) => {
    const { ttl, grace, limit } = values;
    return globalClaimStore.createClaim(
      this.queueName,
      ttl || 300,
      grace || 60,
      limit || 5
    );
  };
}

export default inject('rootStore')(observer(CreateClaim));
