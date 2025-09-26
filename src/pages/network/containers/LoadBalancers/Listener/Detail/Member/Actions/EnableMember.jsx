import { ConfirmAction } from 'containers/Action';
import globalPoolMemberStore from 'stores/octavia/pool-member';

export default class EnableAction extends ConfirmAction {
  get id() {
    return 'enable';
  }

  get title() {
    return t('Enable Member');
  }

  get isDanger() {
    return false;
  }

  get buttonText() {
    return t('Enable');
  }

  get actionName() {
    return t('enable member');
  }

  policy = 'os_load-balancer_api:member:put';

  allowedCheckFunc = (item) => {
    if (!item) return true;
    return (
      this.isOwnerOrAdmin(item) &&
      item.provisioning_status === 'ACTIVE' &&
      item.admin_state_up === false
    );
  };

  isOwnerOrAdmin() {
    return true;
  }

  onSubmit = (values) => {
    const { default_pool_id } = this.containerProps.detail;
    const { id } = values;
    const data = {
      admin_state_up: true,
    };
    return globalPoolMemberStore.update({
      member_id: id,
      default_pool_id,
      data,
    });
  };
}
