import { ConfirmAction } from 'containers/Action';
import globalInstancesUsersStore from 'stores/trove/instances-user';

export default class UserDelete extends ConfirmAction {
  get id() {
    return 'delete-database-user';
  }

  get title() {
    return t('Delete User');
  }

  get actionName() {
    return t('Delete User');
  }

  get buttonType() {
    return 'danger';
  }

  allowedCheckFunction = () => true;

  policy = 'trove:instance:extension:user:delete';

  onSubmit = (item) => {
    const id = this.containerProps.detail.id;
    const name = item.name || this.item.name;
    return globalInstancesUsersStore.deleteUser({id, name});
  };
}