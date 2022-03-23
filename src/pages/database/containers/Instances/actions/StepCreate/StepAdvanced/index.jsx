import { inject, observer } from 'mobx-react';
import Base from 'components/Form';
import globalInstancesStore from '@/stores/trove/instances';

@inject('rootStore')
@observer
export default class StepAdvanced extends Base {

  init() {
    this.getConfigurationGroups();
  }
  get title() {
    return t('Initialize Databases');
  }

  get name() {
    return 'Initialize Databases';
  }

  allowed = () => Promise.resolve();

  get configurationGroup() {
    return (globalInstancesStore.list.data || []).map((it) => ({
      label: it.name,
      value: it.id
    }));
  }

  async getConfigurationGroups() {
    globalInstancesStore.listConfigurationGroup();
  }

  get formItems() {
    return [
      {
        name: "project",
        label: t("Project"),
        type: "label"
      },
      {
        type: "divider"
      },
      {
        name: "configurationGroup",
        label: t("Configuration Group"),
        type: 'select',
        options: this.configurationGroup
      }
    ]
  }
}
