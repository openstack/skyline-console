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
import { observer, inject } from 'mobx-react';
import { StackStore } from 'stores/heat/stack';
import yaml from 'js-yaml';
import { Card } from 'antd';
import CodeEditor from 'components/CodeEditor';

export class Template extends Component {
  constructor(props) {
    super(props);
    this.store = new StackStore();
  }

  componentDidMount() {
    this.fetchData();
  }

  get params() {
    const { params } = this.props.match;
    return params;
  }

  fetchData = () => {
    this.store.getTemplate(this.params);
  };

  renderContent = () => {
    const { template } = this.store;
    const content = yaml.dump(template);
    const props = {
      value: content,
      mode: 'yaml',
      options: {
        readOnly: true,
      },
    };
    return <CodeEditor {...props} />;
  };

  render() {
    return (
      <Card style={{ marginLeft: 16, marginRight: 16 }}>
        {this.renderContent()}
      </Card>
    );
  }
}

export default inject('rootStore')(observer(Template));
