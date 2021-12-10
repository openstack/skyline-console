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

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const yaml = require('js-yaml');

const root = (dir) =>
  `${path.resolve(__dirname, '../../')}/${dir}`.replace(/(\/+)/g, '/');

const loadYaml = (filePath) => {
  try {
    return yaml.load(fs.readFileSync(filePath), 'utf8');
  } catch (e) {
    return false;
  }
};

function getZhJson() {
  const jsonPath = root('../src/locales/zh.json');
  try {
    const rawData = fs.readFileSync(jsonPath);
    const translate = JSON.parse(rawData);
    return translate;
  } catch (e) {
    return {};
  }
}

function getConfig() {
  const cypressFolder = 'e2e';
  const config = loadYaml(root(`${cypressFolder}/config/config.yaml`)) || {};
  const tryFile = root(`${cypressFolder}/config/local_config.yaml`);
  if (fs.existsSync(tryFile)) {
    // merge local_config
    const local_config = loadYaml(tryFile);
    if (typeof local_config === 'object') {
      _.assign(config, local_config);
    }
  }
  config.translate = getZhJson();
  return config;
}

module.exports = {
  getConfig,
};
