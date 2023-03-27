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
import { inject, observer } from 'mobx-react';
import renderRoutes from 'utils/RouterConfig';
import i18n from 'core/i18n';
import DocumentTitle from 'react-document-title';
import styles from './index.less';

export class BlankLayout extends Component {
  constructor(props) {
    super(props);
    console.log('props', props);
    this.routes = props.route.routes;
  }

  get rootStore() {
    return this.props.rootStore;
  }

  get info() {
    const { info = {} } = this.rootStore;
    return info || {};
  }

  get title() {
    const { title = { zh: t('Cloud'), en: 'Cloud' } } = this.info;
    const { getLocaleShortName } = i18n;
    const language = getLocaleShortName();
    return title[language] || t('Cloud') || 'Cloud';
  }

  render() {
    return (
      <DocumentTitle title={this.title}>
        <div className={styles.container}>
          <div className={styles.main}>{renderRoutes(this.routes)}</div>
        </div>
      </DocumentTitle>
    );
  }
}

export default inject('rootStore')(observer(BlankLayout));
