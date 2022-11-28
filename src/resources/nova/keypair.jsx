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

import React from 'react';
import ItemActionButtons from 'components/Tables/Base/ItemActionButtons';
import CreateKeyPair from 'pages/compute/containers/Keypair/actions/Create';
import styles from './keypair.less';

export const getKeyPairHeader = (self, name = 'keypair') => {
  const onFinishCreateKeyPair = async () => {
    await self.getKeypairs(); // refresh keypairs
    const { createdItem } = self.keyPairStore;
    const newItem = self.keypairs.find(
      (it) => it.name === (createdItem || {}).name
    );
    if (newItem) {
      const initKeyPair = {
        selectedRowKeys: [newItem.id],
        selectedRows: [newItem],
      };
      self.setState(
        {
          initKeyPair,
        },
        () => {
          self.updateFormValue(name, newItem);
        }
      );
    }
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <span>
        {t(
          'The key pair allows you to SSH into your newly created instance. You can select an existing key pair, import a key pair, or generate a new key pair.'
        )}
      </span>
      <span className={styles['action-wrapper']}>
        <ItemActionButtons
          actions={{ moreActions: [{ action: CreateKeyPair }] }}
          onFinishAction={onFinishCreateKeyPair}
        />
      </span>
    </div>
  );
};
