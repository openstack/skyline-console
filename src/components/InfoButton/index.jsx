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

import React, { useState } from 'react';
import { Button, Card } from 'antd';
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons';

export default function InfoButton(props) {
  const { content, defaultCollapsed = false, title, size = 'small' } = props;
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const onChangeCollapsed = () => {
    setCollapsed(!collapsed);
  };

  if (collapsed) {
    return (
      <Button onClick={onChangeCollapsed} size={size}>
        <CompressOutlined />
      </Button>
    );
  }
  const closeButton = (
    <Button onClick={onChangeCollapsed} size={size}>
      <ExpandOutlined />
    </Button>
  );
  return (
    <div>
      <Card title={title} extra={closeButton}>
        {content}
      </Card>
    </div>
  );
}
