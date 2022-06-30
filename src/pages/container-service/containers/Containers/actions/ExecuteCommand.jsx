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

import React from 'react';
import { Typography } from 'antd';
import { inject, observer } from 'mobx-react';
import { ModalAction } from 'containers/Action';
import globalContainersStore from 'src/stores/zun/containers';
import { checkItemAction } from 'resources/zun/container';
import Notify from 'src/components/Notify';

export class ExecuteCommandContainer extends ModalAction {
  static id = 'execute-command';

  static title = t('Execute Command');

  static buttonText = t('Execute Command');

  static policy = 'container:execute';

  static aliasPolicy = 'zun:container:execute';

  static allowed = (item) => checkItemAction(item, 'execute');

  get name() {
    return t('Execute Command');
  }

  get showNotice() {
    return false;
  }

  get defaultValue() {
    const { name } = this.item;
    return {
      name,
    };
  }

  get formItems() {
    return [
      {
        name: 'name',
        label: t('Container Name'),
        type: 'label',
      },
      {
        name: 'command',
        label: t('Command'),
        type: 'input',
        placeholder: t('The command to execute'),
      },
    ];
  }

  onSubmit = async (values) => {
    const { uuid, name } = this.item;
    const { command } = values;
    const { Title, Paragraph } = Typography;
    try {
      const cb = await globalContainersStore.execute(uuid, { command });
      Notify.warn(
        t('Command was successfully executed at container {name}.', {
          name,
        }),
        <>
          <Title level={5}>{`${t('Command')}: ${command}`}</Title>
          <Title level={5}>{`${t('Outputs')}:`}</Title>
          <Paragraph>
            {cb.output ? <pre>{cb.output}</pre> : t('No Outputs')}
          </Paragraph>
        </>
      );
      return Promise.resolve();
    } catch (error) {
      Notify.errorWithDetail(error);
      return Promise.reject(error);
    }
  };
}

export default inject('rootStore')(observer(ExecuteCommandContainer));
