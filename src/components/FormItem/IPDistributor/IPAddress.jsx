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

import React, { useState } from 'react';
import { Select, Row, Col, Input } from 'antd';

export default ({ value = {}, onChange }) => {
  const [type, setType] = useState(value.type || 'dhcp');
  const [ip, setIp] = useState(value.ip || undefined);

  const triggerChange = (changedValue) => {
    onChange &&
      onChange({
        ip,
        type,
        ...value,
        ...changedValue,
      });
  };

  const onTypeChange = (e) => {
    const newType = e || 'dhcp';
    setType(newType);
    triggerChange({
      type: newType,
    });
  };

  const onIpChange = (e) => {
    const newIp = e.currentTarget.value;
    setIp(newIp);
    triggerChange({
      ip: newIp,
    });
  };

  return (
    <Row gutter={[16]}>
      <Col span={12}>
        <Select
          value={type}
          onChange={onTypeChange}
          options={[
            {
              value: 'dhcp',
              label: t('Automatically Assigned Address'),
            },
            {
              value: 'manual',
              label: t('Manual input'),
            },
          ]}
        />
      </Col>
      <Col span={12}>
        {type === 'manual' && <Input onChange={onIpChange} defaultValue={ip} />}
      </Col>
    </Row>
  );
};
