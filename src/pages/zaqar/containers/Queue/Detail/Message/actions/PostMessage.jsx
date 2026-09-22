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
import globalMessageStore from 'stores/zaqar/message';

export class PostMessage extends ModalAction {
  static id = 'post-message';

  static title = t('Post Message');

  static policy = 'messages:create';

  static allowed = () => Promise.resolve(true);

  init() {
    this.store = globalMessageStore;
  }

  get name() {
    return t('Post Message');
  }

  get queueName() {
    // containerProps is the List component's full props including route match
    const { match } = this.containerProps || {};
    if (match && match.params && match.params.id) {
      return match.params.id;
    }
    // fallback: try direct match prop
    const { match: directMatch } = this.props || {};
    return directMatch && directMatch.params && directMatch.params.id;
  }

  get formItems() {
    return [
      {
        name: 'body',
        label: t('Message Body'),
        type: 'textarea',
        required: true,
        placeholder: t('Enter message body (text or JSON)'),
        rows: 4,
      },
      {
        name: 'ttl',
        label: t('TTL (seconds)'),
        type: 'input-number',
        required: false,
        min: 60,
        max: 1209600,
        placeholder: t('Default: 3600'),
        help: t('Time-to-live in seconds (60 – 1,209,600). Default is 3600.'),
      },
    ];
  }

  onSubmit = (values) => {
    const { body, ttl } = values;
    return globalMessageStore.create(this.queueName, body, ttl || 3600);
  };
}

export default inject('rootStore')(observer(PostMessage));
