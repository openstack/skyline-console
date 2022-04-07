import { ConfirmAction } from 'containers/Action';
import globalInstancesDatabases from 'stores/trove/instances-database';

export default class DatabaseDelete extends ConfirmAction {
  get id() {
    return 'delete-database-database';
  }

  get title() {
    return t('Delete Database');
  }

  get actionName() {
    return t('Delete Database');
  }

  get buttonType() {
    return 'danger';
  }

  allowedCheckFunction = () => true;

  policy = "instance:extension:database:delete";

  onSubmit = (item) => {
    const id = this.containerProps.detail.id;
    const name = item.name || this.item.name;
    return globalInstancesDatabases.deleteDatabase({ id, name });
  };
}