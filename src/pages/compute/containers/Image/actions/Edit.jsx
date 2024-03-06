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
import globalImageStore from 'stores/glance/image';
import { imageOS, isOwner } from 'resources/glance/image';
import { has, get, isNumber } from 'lodash';
import { isActive } from 'resources/nova/instance';
import { NoSetValue, getOptionsWithNoSet } from 'utils/index';
import { cpuPolicyList, cpuThreadPolicyList } from 'resources/nova/flavor';

export class Edit extends ModalAction {
  init() {
    this.store = globalImageStore;
  }

  static id = 'image-edit';

  static title = t('Edit Image');

  static buttonText = t('Edit');

  get name() {
    return t('edit image');
  }

  get enableCinder() {
    return this.props.rootStore.checkEndpoint('cinder');
  }

  get labelCol() {
    return {
      xs: { span: 8 },
      sm: { span: 8 },
    };
  }

  get defaultValue() {
    const {
      visibility,
      hw_qemu_guest_agent,
      hw_cpu_policy,
      hw_cpu_thread_policy,
      min_ram,
    } = this.item;
    return {
      ...this.item,
      protected: this.item.protected,
      visibility: visibility === 'public',
      hw_qemu_guest_agent,
      hw_cpu_policy: hw_cpu_policy || NoSetValue,
      hw_cpu_thread_policy: hw_cpu_thread_policy || NoSetValue,
      min_ram: min_ram / 1024,
    };
  }

  static policy = 'modify_image';

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve((isActive(item) && isOwner(item)) || isAdminPage);
  };

  get osList() {
    return Object.keys(imageOS).map((key) => ({
      value: key,
      label: imageOS[key],
    }));
  }

  get yesNoList() {
    return [
      { value: 'yes', label: t('Yes') },
      { value: 'no', label: t('No') },
    ];
  }

  getOptions() {
    return [{ label: t('Protected'), value: 'protected' }];
  }

  get formItems() {
    const { more } = this.state;
    const zeroTip = t('If the value is set to 0, it means unlimited');
    return [
      {
        name: 'name',
        label: t('Name'),
        type: 'input-name',
        isImage: true,
        required: true,
      },
      {
        name: 'os_distro',
        label: t('OS'),
        type: 'select',
        options: this.osList,
        required: true,
      },
      {
        name: 'os_version',
        label: t('OS Version'),
        type: 'input',
        required: true,
      },
      {
        name: 'os_admin_user',
        label: t('OS Admin'),
        type: 'input',
        required: true,
        extra: t(
          'In general, administrator for Windows, root for Linux, please fill by image uploading.'
        ),
      },
      {
        name: 'min_disk',
        label: t('Min System Disk (GiB)'),
        type: 'input-int',
        min: 0,
        max: 500,
        display: this.enableCinder,
        required: this.enableCinder,
        extra: this.enableCinder ? zeroTip : null,
      },
      {
        name: 'min_ram',
        label: t('Min Memory (GiB)'),
        type: 'input-int',
        min: 0,
        max: 500,
        required: true,
        extra: zeroTip,
      },
      {
        name: 'visibility',
        label: t('Visibility'),
        type: 'check',
        content: t('Public'),
        hidden: !this.isAdminPage,
      },
      {
        name: 'protected',
        label: t('Protected'),
        type: 'check',
        content: t('Protected'),
      },
      {
        name: 'description',
        label: t('Description'),
        type: 'textarea',
        maxLength: 255,
      },
      {
        name: 'more',
        label: t('Advanced Options'),
        type: 'more',
      },
      {
        name: 'hw_qemu_guest_agent',
        label: t('qemu_guest_agent enabled'),
        type: 'radio',
        onlyRadio: true,
        options: this.yesNoList,
        tip: t(
          'It is recommended to install and use this agent. The instance created with this image can be used to modify the password (qemu_guest_agent needs to be installed when creating the image).'
        ),
        hidden: !more,
      },
      {
        name: 'hw_cpu_policy',
        label: t('CPU Policy'),
        type: 'select',
        options: getOptionsWithNoSet(cpuPolicyList),
        hidden: !more,
        required: more,
      },
      {
        name: 'hw_cpu_thread_policy',
        label: t('CPU Thread Policy'),
        type: 'select',
        options: getOptionsWithNoSet(cpuThreadPolicyList),
        hidden: !more,
        required: more,
      },
    ];
  }

  onSubmit = (values) => {
    const {
      more,
      protected: isProtected = false,
      visibility = false,
      hw_cpu_policy,
      hw_cpu_thread_policy,
      min_ram,
      ...rest
    } = values;
    const newValues = {
      protected: isProtected,
      visibility: visibility ? 'public' : 'private',
      ...rest,
    };
    if (isNumber(min_ram)) {
      newValues.min_ram = min_ram * 1024;
    }
    if (hw_cpu_policy !== NoSetValue) {
      newValues.hw_cpu_policy =
        hw_cpu_policy || this.item.originData.hw_cpu_policy;
    }
    if (hw_cpu_thread_policy !== NoSetValue) {
      newValues.hw_cpu_thread_policy =
        hw_cpu_thread_policy || this.item.originData.hw_cpu_thread_policy;
    }
    const changeValues = [];
    Object.keys(newValues).forEach((key) => {
      if (
        has(this.item.originData, key) &&
        get(this.item.originData, key) !== newValues[key]
      ) {
        const item = {
          op: 'replace',
          path: `/${key}`,
          value: newValues[key],
        };
        changeValues.push(item);
      } else if (!has(this.item.originData, key) && newValues[key]) {
        const item = {
          op: 'add',
          path: `/${key}`,
          value: newValues[key],
        };
        changeValues.push(item);
      }
    });
    if (this.item.originData.hw_cpu_policy && hw_cpu_policy === NoSetValue) {
      changeValues.push({
        op: 'remove',
        path: '/hw_cpu_policy',
      });
    }
    if (
      this.item.originData.hw_cpu_thread_policy &&
      hw_cpu_thread_policy === NoSetValue
    ) {
      changeValues.push({
        op: 'remove',
        path: '/hw_cpu_thread_policy',
      });
    }
    if (changeValues.length === 0) {
      return Promise.resolve();
    }
    return this.store.update({ id: this.item.id }, changeValues);
  };
}

export default inject('rootStore')(observer(Edit));
