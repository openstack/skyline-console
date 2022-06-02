import React, { useState } from 'react';
import { Button, Card } from 'antd';
import { ExpandOutlined, CompressOutlined } from '@ant-design/icons';

export default function InfoButton(props) {
  const { content, defaultCollapsed = false, title } = props;
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const onChangeCollapsed = () => {
    setCollapsed(!collapsed);
  };

  if (collapsed) {
    return (
      <Button onClick={onChangeCollapsed}>
        <CompressOutlined />
      </Button>
    );
  }
  const closeButton = (
    <Button onClick={onChangeCollapsed}>
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
