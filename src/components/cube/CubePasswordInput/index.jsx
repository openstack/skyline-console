import React, { Component, createRef } from 'react';
import { Input } from 'antd';
import styles from './index.less';

export default class CubePasswordInput extends Component {
  constructor(props) {
    super(props);
    this.inputRef = createRef();
  }

  focus() {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  render() {
    return (
      <Input.Password
        ref={this.inputRef}
        size="md"
        className={styles['cube-password-input']}
        {...this.props}
      />
    );
  }
}
