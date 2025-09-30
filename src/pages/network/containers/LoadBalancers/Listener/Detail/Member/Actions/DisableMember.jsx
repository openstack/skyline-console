import { ConfirmAction } from 'containers/Action';
import globalPoolMemberStore from 'stores/octavia/pool-member';

export default class DisableAction extends ConfirmAction {
  get id() {
    return 'disable';
  }

  get title() {
    return t('Disable Member');
  }

  get isDanger() {
    return false;
  }

  get buttonText() {
    return t('Disable');
  }

  get actionName() {
    return t('disable member');
  }

  policy = 'os_load-balancer_api:member:put';

  allowedCheckFunc = (item) => {
    if (!item) return true;
    return (
      this.isOwnerOrAdmin(item) &&
      item.provisioning_status === 'ACTIVE' &&
      item.admin_state_up
    );
  };

  isOwnerOrAdmin() {
    return true;
  }

  onSubmit = (values) => {
    const { default_pool_id } = this.containerProps.detail;
    const { id } = values;
    const data = {
      admin_state_up: false,
    };
    return globalPoolMemberStore.update({
      member_id: id,
      default_pool_id,
      data,
    });
  };
}
