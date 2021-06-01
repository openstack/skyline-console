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

import React, { Component } from 'react';
import { Col, Form, Input, Row, Select } from 'antd';
import { macAddressValidate } from 'utils/validate';

class MacAddressInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: {
        type: '',
        mac: '',
      },
    };
  }

  handleSelectChange = (e) => {
    const { name } = this.state;
    this.setState(
      {
        name: {
          ...name,
          type: e,
        },
      },
      () => {
        const { onChange } = this.props;
        if (onChange) {
          onChange(this.state.name);
        }
      }
    );
  };

  handleInputChange = (e) => {
    const { name } = this.state;
    this.setState({
      name: {
        ...name,
        mac: e,
      },
    });
  };

  render() {
    const { value, name, options } = this.props;
    const { type } = value || { type: undefined };

    return (
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name={[name, 'type']} style={{ marginBottom: 0 }}>
            <Select
              placeholder={t('Please select')}
              options={
                options || [
                  {
                    label: t('Auto allocate mac address'),
                    value: 'auto',
                  },
                  {
                    label: t('Manual input'),
                    value: 'manual',
                  },
                ]
              }
              onChange={this.handleSelectChange}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          {
            value && type === 'manual' ? (
              <Form.Item
                hidden={type === 'auto' || type === undefined}
                name={[name, 'mac']}
                rules={[
                  {
                    validator: macAddressValidate,
                    required: true,
                    message: t(
                      'Invalid Mac Address. Please Use ":" as separator.'
                    ),
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <Input maxLength={17} onChange={this.handleInputChange} />
              </Form.Item>
            ) : null
            // <span style={{ lineHeight: '32px', display: type !== 'auto' ? 'none' : '' }}>
            //   {t('Mac Address Numbers can be use {num}'
            //     , { num: 123 })}
            // </span>
          }
        </Col>
      </Row>
    );
  }
}

export default MacAddressInput;
