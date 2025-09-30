import React, { PureComponent } from 'react';
import { Spin } from 'antd';

export default class index extends PureComponent {
  render() {
    const { text = t('Loading...') } = this.props;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80px',
        }}
      >
        <Spin />
        <span style={{ marginLeft: 8 }}>{text}</span>
      </div>
    );
  }
}
