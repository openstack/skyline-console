const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const { merge } = require('lodash');

const root = (dir) =>
  `${path.resolve(__dirname, './')}/${dir}`.replace(/(\/+)/g, '/');

const loadYaml = (filePath) => {
  try {
    return yaml.load(fs.readFileSync(filePath), 'utf8');
  } catch (e) {
    return false;
  }
};

const getServerConfig = (key) => {
  // parse config yaml
  const config = loadYaml(root('./config.yaml')) || {};

  const tryFile = root('./local_config.yaml');
  if (fs.existsSync(tryFile)) {
    // merge local_config
    const local_config = loadYaml(tryFile);
    if (typeof local_config === 'object') {
      merge(config, local_config);
    }
  }

  return key ? config[key] : config;
};

module.exports = {
  getServerConfig,
  root,
};
