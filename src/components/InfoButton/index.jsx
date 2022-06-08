// Copyright 2022 99cloud
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

import React, { useState, useEffect } from 'react';
import { Button, Card, Tooltip, Switch } from 'antd';
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons';

const seconds = 5;

export default function InfoButton(props) {
  const {
    content,
    defaultCollapsed = false,
    size = 'small',
    ableAuto = true,
    tip = t(
      'When auto-expand/close is enabled, if there is no operation in the pop-up window, the pop-up window will be closed automatically after { seconds } seconds, and it will be automatically expanded when the displayed content changes.',
      { seconds }
    ),
    checkValue = '',
  } = props;
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [auto, setAuto] = useState(ableAuto);
  const [timer, setTimer] = useState(null);
  const [hover, setHover] = useState(false);

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
    }
    setTimer(null);
  };

  const open = () => {
    setCollapsed(false);
  };

  const close = () => {
    setCollapsed(true);
    clearTimer();
  };

  const startTimer = () => {
    if (collapsed) {
      return;
    }
    if (timer) {
      clearTimer();
    }
    const newTimer = setTimeout(() => {
      if (!collapsed) {
        close();
      }
    }, seconds * 1000);
    setTimer(newTimer);
  };

  useEffect(() => {
    if (!auto) {
      return;
    }
    if (!collapsed) {
      if (hover) {
        clearTimer();
      } else {
        startTimer();
      }
    }
  }, [collapsed, hover]);

  useEffect(() => {
    if (auto) {
      open();
      startTimer();
    }
  }, [checkValue]);

  const onChangeAuto = (checked) => {
    setAuto(checked);
  };

  const renderSwitch = () => {
    if (!ableAuto) {
      return null;
    }
    return (
      <Tooltip title={tip}>
        <Switch size="small" checked={auto} onChange={onChangeAuto} />
      </Tooltip>
    );
  };

  const onMouseEnter = () => {
    setHover(true);
  };

  const onMouseLeave = () => {
    setHover(false);
  };

  if (collapsed) {
    return (
      <div
        style={{ padding: 8 }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="content-wrapper"
      >
        <Tooltip title={t('Expand')}>
          <Button onClick={open} size={size}>
            <ExpandOutlined />
          </Button>
        </Tooltip>
      </div>
    );
  }
  const closeButton = (
    <Tooltip title={t('Close')}>
      <Button onClick={close} size={size}>
        <CompressOutlined />
      </Button>
    </Tooltip>
  );
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="content-wrapper"
      style={{ minWidth: 150 }}
    >
      <Card title={renderSwitch()} extra={closeButton}>
        {content}
      </Card>
    </div>
  );
}
