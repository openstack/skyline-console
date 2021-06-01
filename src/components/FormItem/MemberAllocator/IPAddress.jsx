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
import { InputNumber, Row, Col, Input } from 'antd';

export default ({ value = {}, onChange, disabled }) => {
  const [ip, setIp] = useState(value.ip || undefined);
  const [protocol_port, setPort] = useState(value.protocol_port || undefined);
  const [weight, setWeight] = useState(value.weight);

  const triggerChange = (changedValue) => {
    onChange({
      ip,
      protocol_port,
      weight,
      ...value,
      ...changedValue,
    });
  };

  const onIpChange = ({ target: { value: newIP } }) => {
    setIp(newIP);
    triggerChange({
      ip: newIP,
    });
  };

  const onPortChange = (val) => {
    val && setPort(val);
    val &&
      triggerChange({
        protocol_port: val,
      });
  };

  const onWeightChange = (val) => {
    val && setWeight(val);
    val &&
      triggerChange({
        weight: val,
      });
  };

  return (
    <Row gutter={[16]}>
      <Col span={12}>
        <Input
          style={{ maxWidth: 210 }}
          onChange={onIpChange}
          value={ip}
          disabled={disabled}
        />
      </Col>
      <Col span={6}>
        <InputNumber
          min={1}
          max={65535}
          style={{ width: '100%' }}
          value={protocol_port}
          onChange={onPortChange}
        />
      </Col>
      <Col span={6}>
        <InputNumber
          min={1}
          max={256}
          style={{ width: '100%' }}
          value={weight}
          onChange={onWeightChange}
        />
      </Col>
    </Row>
  );
};
