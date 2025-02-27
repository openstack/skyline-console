import React, { Component, createRef } from 'react';
import { Select } from 'antd';
import ChevronDownSvgIcon from 'asset/cube/monochrome/chevron_down.svg';
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

  render() {
    return (
      <Select
        ref={this.inputRef}
        size="md"
        {...this.props}
        suffixIcon={
          <ChevronDownSvgIcon width={14} height={12} className={styles.icon} />
        }
      />
    );
  }
}
