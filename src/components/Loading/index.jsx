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

import React from 'react';
import { Icon, Modal } from 'antd';

const Loading = ({ pastDelay, timedOut, error }) => {
  if (pastDelay) {
    return (
      <Modal
        visible
        wrapClassName="backgroundNone"
        closable={false}
        footer={null}
        bodyStyle={{ background: 'rgba(208, 164, 34, 0)' }}
        style={{ textAlign: 'center', background: 'none' }}
      >
        <Icon
          type="loading"
          style={{ fontSize: 32, color: globalCSS.primaryColor }}
          theme="outlined"
        />
        <p>Loading...</p>
      </Modal>
    );
  }
  if (timedOut) {
    return <div>Taking a long time...</div>;
  }
  if (error) {
    return <div>Error!</div>;
  }
  return null;
};

export default Loading;
