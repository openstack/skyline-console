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
import PropTypes from 'prop-types';
import { Router } from 'react-router';
import renderRoutes from 'utils/RouterConfig';
import { Provider } from 'mobx-react';
// eslint-disable-next-line import/no-unresolved
import 'styles/main.less';

import routes from './routes';
import i18n from './i18n';

class App extends Component {
  static propTypes = {
    rootStore: PropTypes.object,
    history: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { initDone: false };
  }

  componentDidMount() {
    this.appLoadLocales();
  }

  appLoadLocales() {
    const { loadLocales } = i18n;
    loadLocales();
    this.setState({ initDone: true });
  }

  render() {
    const { rootStore, history } = this.props;
    const { initDone } = this.state;

    return (
      initDone && (
        <Provider rootStore={rootStore}>
          <Router history={history}>{renderRoutes(routes)}</Router>
        </Provider>
      )
    );
  }
}

export default App;
