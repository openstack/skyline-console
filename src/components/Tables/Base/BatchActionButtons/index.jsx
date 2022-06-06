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
import { Dropdown, Menu, Button, Tooltip } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { generateId } from 'utils/index';
import ActionButton from '../ActionButton';
import { getActionsByPolicy } from '../Action';
import styles from './index.less';

const updateConf = (conf, selectedItems) => {
  const { id, title, actionType, buttonType, buttonText, isDanger } = conf;
  return {
    id,
    title,
    name: buttonText || title,
    actionType,
    buttonType,
    isDanger,
    action: conf,
    isAllowed: selectedItems.length > 0,
    items: selectedItems,
    isBatch: true,
    needHide: false,
  };
};

TableBatchButtons.defaultProps = {
  visibleButtonNumber: 1,
};

TableBatchButtons.prototypes = {
  visibleButtonNumber: PropTypes.number,
};

function DropdownActionButton({
  actions,
  selectedItems,
  onFinishAction,
  containerProps,
  onClickAction,
  onCancelAction,
}) {
  if (actions.length < 1) {
    return null;
  }
  const menuItems = actions.map((it) => {
    const key = `table-batch-more-${generateId()}`;
    const newConf = updateConf(it, selectedItems);
    const { isDanger, name } = newConf;
    newConf.onFinishAction = onFinishAction;
    newConf.isDanger = !!isDanger;
    if (!selectedItems.length) {
      return (
        <Menu.Item key={key} disabled style={{ textAlign: 'center' }}>
          {name}
        </Menu.Item>
      );
    }
    return (
      <Menu.Item key={key}>
        <ActionButton
          {...newConf}
          buttonType="link"
          onFinishAction={onFinishAction}
          containerProps={containerProps}
          onClickAction={onClickAction}
          onCancelAction={onCancelAction}
          buttonClassName={styles['more-action-btn']}
        />
      </Menu.Item>
    );
  });
  const menu = <Menu>{menuItems}</Menu>;
  return (
    <Dropdown overlay={menu} overlayClassName={styles['table-batch-menu']}>
      <Button type="primary">
        {t('More Actions')} {<DownOutlined />}
      </Button>
    </Dropdown>
  );
}

export default function TableBatchButtons(props) {
  const {
    selectedItems,
    visibleButtonNumber,
    batchActions,
    onFinishAction,
    containerProps,
    onClickAction,
    onCancelAction,
    resourceName,
    isAdminPage,
  } = props;
  let moreButton = null;
  let batchButtons = null;
  let showedActions = [];
  let restActions = [];
  const actionList = getActionsByPolicy({
    actions: batchActions,
    containerProps,
    isAdminPage,
  });
  if (visibleButtonNumber < actionList.length) {
    if (visibleButtonNumber < 0) {
      restActions = actionList;
    } else {
      showedActions = actionList.slice(0, visibleButtonNumber);
      restActions = actionList.slice(visibleButtonNumber);
    }
  } else {
    showedActions = actionList;
  }
  batchButtons = showedActions.map((it) => {
    const { isDanger = false, buttonType = 'default' } = it;
    if (!selectedItems || selectedItems.length === 0) {
      return (
        <Tooltip
          title={t('Please select {name} first', { name: resourceName })}
          key={`tooltip-${generateId()}`}
        >
          <Button type={buttonType} disabled danger={isDanger}>
            {it.buttonText || it.title}
          </Button>
        </Tooltip>
      );
    }
    return (
      <ActionButton
        {...updateConf(it, selectedItems)}
        key={`table-batch-action-${generateId()}`}
        // buttonClassName={styles['table-action']}
        onFinishAction={onFinishAction}
        containerProps={containerProps}
        onClickAction={onClickAction}
        onCancelAction={onCancelAction}
      />
    );
  });
  moreButton = (
    <DropdownActionButton
      actions={restActions}
      selectedItems={selectedItems}
      onFinishAction={onFinishAction}
      containerProps={containerProps}
      onClickAction={onClickAction}
      onCancelAction={onCancelAction}
    />
  );
  return (
    <>
      {batchButtons}
      {moreButton}
    </>
  );
}
