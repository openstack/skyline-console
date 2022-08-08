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

import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalVolumeStore from 'stores/cinder/volume';

export class UpdateStatus extends ModalAction {
  static id = 'update-status';

  static title = t('Update Status');

  get name() {
    return t('update status');
  }

  get defaultValue() {
    const { name, id, volume_type, size } = this.item;
    const value = {
      volume: `${name || id}(${volume_type} | ${size}GiB)`,
      status: 'available',
    };
    return value;
  }

  static policy = 'volume_extension:volume_admin_actions:reset_status';

  static allowed = () => Promise.resolve(true);

  get tips() {
    return t(
      'Do not reset the normally mounted volume to the "available"、"maintenance" or "error" status. The reset state does not remove the volume from the instance. If you need to remove the volume from the instance, please go to the console of the corresponding project and use the "detach" operation.'
    );
  }

  get formItems() {
    const { status } = this.state;
    const statusList = [
      { value: 'available', label: t('Available') },
      { value: 'maintenance', label: t('Maintained') },
      { value: 'error', label: t('Error') },
      { value: 'in-use', label: t('In Use') },
    ];
    return [
      {
        name: 'volume',
        label: t('Volume'),
        type: 'label',
        iconType: 'volume',
      },
      {
        name: 'status',
        label: t('Status'),
        type: 'select',
        required: true,
        options: statusList,
        onChange: this.handleStatusChange,
        extra:
          status === 'in-use'
            ? t(
                'The volume status can be reset to in-use only when the previous status is in-use.'
              )
            : '',
      },
    ];
  }

  handleStatusChange = (status) => {
    this.setState({
      status,
    });
  };

  init() {
    this.store = globalVolumeStore;
  }

  onSubmit = (values) => {
    const { id } = this.item;
    delete values.volume;
    return this.store.resetStatus(id, values);
  };
}

export default inject('rootStore')(observer(UpdateStatus));
