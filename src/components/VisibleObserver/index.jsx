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
import { observer } from 'mobx-react';

@observer
export default class Observer extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: !window.IntersectionObserver };
    this.io = null;
    this.container = null;
  }

  componentDidMount() {
    (window.IntersectionObserver
      ? Promise.resolve()
      : import('intersection-observer')
    ).then(() => {
      this.io = new window.IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.setState({ visible: entry.isIntersecting });
        });
      }, {});
      this.io.observe(this.container);
    });
  }

  componentWillUnmount() {
    if (this.io) {
      this.io.disconnect();
    }
  }

  render() {
    return (
      // The findDOMNode implementation could also be used here, but is not recommended
      <div
        ref={(div) => {
          this.container = div;
        }}
        {...this.props}
      >
        {Array.isArray(this.props.children)
          ? this.props.children.map((child) => child(this.state.visible))
          : this.props.children(this.state.visible)}
      </div>
    );
  }
}
