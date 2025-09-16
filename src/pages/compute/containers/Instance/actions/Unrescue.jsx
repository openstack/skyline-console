import { ConfirmAction } from 'src/containers/Action';
import globalServerStore from 'src/stores/nova/instance';
import { isNotLockedOrAdmin, checkStatus } from 'resources/nova/instance';

export default class UnRescueInstanceAction extends ConfirmAction {
  get id() {
    return 'unrescue';
  }

  get title() {
    return t('Unrescue');
  }

  get buttonText() {
    return t('Unrescue');
  }

  get isAsyncAction() {
    return true;
  }

  allowedCheckFunc = (item) => {
    if (!item) {
      return true;
    }
    // Allow Unrescue only if instance is rescue and not locked
    return (
      isNotLockedOrAdmin(item, this.isAdminPage) &&
      checkStatus(['rescue'], item)
    );
  };

  onSubmit = (item) => {
    const { id } = item || this.item;
    return globalServerStore.unrescue({ id });
  };
}
