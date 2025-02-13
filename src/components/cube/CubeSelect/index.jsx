import React, { Component, createRef } from 'react';
import { Select } from 'antd';
import ChevronDown from 'asset/cube/monochrome/chevron_down.svg';
import styles from './index.less';

export default class CubeSelect extends Component {
  constructor(props) {
    super(props);
    this.inputRef = createRef();
  }

  focus() {
    if (this.inputRef.current) {
      this.inputRef.current.focus();
    }
  }

  renderIcon = () => {
    return (
      <div className={styles.icon}>
        <img src={ChevronDown} alt="dropdown-icon" />
      </div>
    );
  };

  render() {
    return (
      <Select
        ref={this.inputRef}
        size="md"
        {...this.props}
        suffixIcon={this.renderIcon()}
      />
    );
  }
}
