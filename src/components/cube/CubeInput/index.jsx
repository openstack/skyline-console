import React, { Component, createRef } from 'react';
import { Input } from 'antd';

export default class CubeInput extends Component {
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
    return <Input ref={this.inputRef} size="md" {...this.props} />;
  }
}
