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
import SelectLang from 'components/SelectLang';
import { Link } from 'react-router-dom';

import logo from 'src/asset/image/logo.png';
// import loginImage from 'src/asset/image/login.png';
import loginFullImage from 'src/asset/image/loginFull.png';
import loginRightLogo from 'src/asset/image/loginRightLogo.png';
import styles from './index.less';
// import bgcImg from 'src/asset/image/animnbus.png';

@inject('rootStore')
@observer
class AuthLayout extends Component {
  constructor(props) {
    super(props);

    this.routes = props.route.routes;
  }

  render() {
    return (
      <div className={styles.container}>
        <div
          className={styles.left}
          // TODO wait for RGB
          // style={ { backgroundImage: `url(${bgcImg})` } }
        >
          <div className={styles.lang}>
            <SelectLang />
          </div>
          <div className={styles.main}>
            <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={logo} />
                </Link>
              </div>
            </div>
            {renderRoutes(this.routes)}
          </div>
        </div>
        <div className={styles.right}>
          {/* <img alt="" className={styles['login-image']} src={loginImage} /> */}
          <img
            alt=""
            className={styles['login-full-image']}
            src={loginFullImage}
          />
          <div className={styles['full-image-front']} />
          <img
            src={loginRightLogo}
            alt=""
            className={styles['login-right-logo']}
          />
        </div>
      </div>
    );
  }
}

export default AuthLayout;
