
import { inject, observer } from 'mobx-react';
import Base from 'components/Form';

@inject('rootStore')
@observer
export default class StepInitializeDatabases extends Base {

  get title() {
    return t('Initialize Databases');
  }

  get name() {
    return 'Initialize Databases';
  }

  allowed = () => Promise.resolve();

  get defaultValue() {
    const values = {
      project: this.currentProjectName
    };
    return values;
  }

  get formItems() {
    return [
      {
        name: 'project',
        label: t('Project'),
        type: 'label',
      },
      {
        type: 'divider',
      },
      {
        name: 'initialDatabases',
        label: t('Initial Databases'),
        type: 'input',
        required: true,
      },
      {
        name: 'initialAdminUser',
        label: t('Initial Admin User'),
        type: 'input',
        required: true,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'input-password',
        required: true,
      },
    ];
  }
}
