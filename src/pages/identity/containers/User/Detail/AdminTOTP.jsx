// Copyright 2026 WIIT AG
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
import { TOTPConfig } from 'pages/user-center/containers/TOTP';

export class AdminTOTP extends Component {
  get userId() {
    const { detail } = this.props;
    return detail?.id;
  }

  get username() {
    const { detail } = this.props;
    return detail?.name || '';
  }

  render() {
    if (!this.userId) {
      return null;
    }
    return (
      <TOTPConfig
        {...this.props}
        targetUserId={this.userId}
        targetUsername={this.username}
        isAdminView
      />
    );
  }
}

export default inject('rootStore')(observer(AdminTOTP));
