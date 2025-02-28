/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { Button } from 'antd';
import styles from './index.less';

export default class CubeIconButton extends Component {
  render() {
    const { icon: Icon, type = 'default', ...restProps } = this.props;
    return (
      <Button
        {...restProps}
        size="middle"
        type={type}
        className={styles['icon-button']}
        icon={
          <Icon
            width={restProps.width || 16}
            height={restProps.height || 16}
            className={
              type === 'default'
                ? styles['icon-default']
                : styles['icon-primary']
            }
          />
        }
      />
    );
  }
}
