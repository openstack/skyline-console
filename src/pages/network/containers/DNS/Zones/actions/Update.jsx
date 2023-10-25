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
import globalDNSZonesStore from 'stores/designate/zones';
import { Create } from './Create';

export class Update extends Create {
  init() {
    this.store = globalDNSZonesStore;
  }

  static id = 'update-dns-zone';

  static title = t('Edit');

  get name() {
    return t('Edit');
  }

  static policy = 'update_zone';

  static allowed() {
    return Promise.resolve(true);
  }

  get defaultValue() {
    const { masters = [], ...rest } = this.item;
    const mastersValue = masters.map((m, index) => ({
      index,
      value: m,
    }));
    return {
      ...rest,
      masters: mastersValue,
    };
  }

  get formItems() {
    const items = super.formItems;
    return items.map((it) => {
      if (it.name === 'name' || it.name === 'type') {
        return {
          ...it,
          disabled: true,
        };
      }
      return it;
    });
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const { type } = this.item;
    const { masters = [], email, ttl, description } = values;
    const body = {
      description,
      masters: masters.map((m) => m.value),
    };
    if (type === 'PRIMARY') {
      body.email = email;
      body.ttl = ttl;
    }
    return this.store.update({ id }, body);
  };
}

export default inject('rootStore')(observer(Update));
