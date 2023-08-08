const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const { merge, extend, has } = require('lodash');

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
    const localConfig = loadYaml(tryFile);
    if (typeof localConfig === 'object') {
      merge(config, localConfig);
    }
  }

  return key ? config[key] : config;
};

const getObjectConfig = (key) => {
  // parse config yaml
  const config = loadYaml(root('./config.yaml')) || {};
  if (!has(config, key)) {
    return {};
  }
  const defaultConfig = config[key];

  const result = defaultConfig;
  const tryFile = root('./local_config.yaml');
  if (fs.existsSync(tryFile)) {
    // merge local_config
    const localConfig = loadYaml(tryFile);
    extend(result, localConfig[key] || {});
  }

  return result;
};

const getGlobalVariables = () => {
  const variables = getObjectConfig('globalVariables') || {};
  // eslint-disable-next-line no-console
  console.log('globalVariables', variables, JSON.stringify(variables));
  return JSON.stringify(variables);
};

module.exports = {
  getServerConfig,
  root,
  getGlobalVariables,
};
