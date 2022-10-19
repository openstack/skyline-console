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
import { Descriptions, Button } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { isArray, isUndefined } from 'lodash';
import styles from './index.less';

export default class index extends Component {
  getValueContent = (value) => {
    if (isUndefined(value)) {
      return '-';
    }
    if (isArray(value)) {
      // eslint-disable-next-line no-shadow
      return value.map((it, itIndex) => (
        <>
          <div key={`value-${itIndex}`}>{it}</div>
          {itIndex !== value.length - 1 && <br />}
        </>
      ));
    }

    return value;
  };

  onClick = () => {
    const { onClick } = this.props;
    onClick && onClick();
  };

  renderTitle() {
    const { title } = this.props;
    return (
      <span>
        {title}{' '}
        <Button type="link" icon={<FormOutlined />} onClick={this.onClick} />
      </span>
    );
  }

  renderItem() {
    const { items } = this.props;
    const desItems = items.map((it, iIndex) => {
      const { label, value, span, contentStyle = {} } = it;
      const desContent = this.getValueContent(value);
      const options = {
        label,
        key: `item-${label}-${iIndex}`,
        className: styles.label,
      };
      if (span) {
        options.span = span;
      }
      return (
        <Descriptions.Item contentStyle={contentStyle} {...options}>
          {desContent}
        </Descriptions.Item>
      );
    });
    return (
      <Descriptions title={this.renderTitle()} colon={false}>
        {desItems}
      </Descriptions>
    );
  }

  render() {
    return <div>{this.renderItem()}</div>;
  }
}
