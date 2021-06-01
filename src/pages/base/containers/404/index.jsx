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
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';

export default class E404 extends Component {
  render() {
    const actions = (
      <Link to="/base/overview">
        <Button type="primary">{t('Back to Home')}</Button>
      </Link>
    );
    return (
      <Result
        status="404"
        title="404"
        subTitle={t('Sorry, the page you visited does not exist.')}
        extra={actions}
      />
    );
  }
}
