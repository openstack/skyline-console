import { inject, observer } from 'mobx-react';
import globalServerStore from 'stores/nova/instance';
import { ModalAction } from 'containers/Action';
import { getPasswordOtherRule } from 'utils/validate';
import globalImageStore from 'src/stores/glance/image';
import { checkStatus, isIronicInstance, isNotLockedOrAdmin } from 'src/resources/nova/instance';

export class Rescue extends ModalAction {
  static id = 'rescue';

  static title = t('Rescue');

  init() {
    this.store = globalServerStore;
    this.imageStore = globalImageStore;
    this.fetchImages();
  }

  get name() {
    return t('Rescue Instance');
  }

  get tips() {
    return t(
      'The rescue mode is only for emergency purpose, for example in case of a system or access failure. This will shut down your instance and mount the root disk to a temporary server. Then, you will be able to connect to this server, repair the system configuration or recover your data.You may optionally select an image and set a password on the rescue instance server.'
    );
  }

  static isUnrescue = (item) => checkStatus(['rescue'], item);

  static allowed = (item, containerProps) => {
    const { isAdminPage } = containerProps;
    return Promise.resolve(
      !this.isUnrescue(item) &&
      isNotLockedOrAdmin(item, isAdminPage) &&
      !isIronicInstance(item)
    );
  };

  async fetchImages() {
    await this.imageStore.fetchList({ all_projects: this.hasAdminRole });
  }

  get getData() {
    return (this.imageStore.list.data).map((it) => ({ value: it.id, label: it.name })) || [];
  }

  get formItems() {
    return [
      {
        name: 'rescue_image_ref',
        label: t('Select Image'),
        type: 'select',
        options: this.getData,
      },
      {
        name: 'adminPass',
        label: t('Password'),
        type: 'input-password',
        otherRule: getPasswordOtherRule('password', 'instance'),
      },
    ];
  }

  onSubmit = (values) => {
    const { id } = this.item;
    const rescue = {
      rescue: {
        adminPass: values.adminPass,
        rescue_image_ref: values.rescue_image_ref
      }
    }
    return this.store.rescue(id, rescue);
  };
}

export default inject('rootStore')(observer(Rescue));