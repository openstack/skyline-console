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
import AceEditor from 'react-ace';
import ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-json';
// import 'ace-builds/src-noconflict/mode-yaml';
// import 'ace-builds/src-noconflict/mode-groovy';
import 'ace-builds/src-noconflict/theme-github';

import './custom.less';

// eslint-disable-next-line import/no-webpack-loader-syntax,import/no-unresolved
const worker = require('file-loader?esModule=false!ace-builds/src-noconflict/worker-json');

ace.config.setModuleUrl('ace/mode/json_worker', worker);

export default class AceEditorWrapper extends React.Component {
  render() {
    return (
      <AceEditor
        theme="github"
        width="auto"
        height="100%"
        tabSize={2}
        debounceChangePeriod={200}
        editorProps={{ $blockScrolling: true }}
        showPrintMargin={false}
        wrapEnabled
        {...this.props}
        // setOptions={{ useWorker: false }}
      />
    );
  }
}
