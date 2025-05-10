const fs = require('fs');
const path = require('path');

const yaml = require('js-yaml');
const { merge, extend, has } = require('lodash');

const root = (dir) =>
  `${path.resolve(__dirname, './')}/${dir}`.replace(/(\/+)/g, '/');

const configRoot = (dir) =>
  `${path.resolve(__dirname, '../config')}/${dir}`.replace(/(\/+)/g, '/');

const srcRoot = (dir) =>
  `${path.resolve(__dirname, '../src')}/${dir}`.replace(/(\/+)/g, '/');

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

const getConfig = (key) => {
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

const THEMES = {
  default: {
    themeFile: 'theme.js',
    lessVariablesName: 'styles/variables',
    globalVariables: {
      menuTheme: 'dark',
      skylineThemeName: 'default',
    },
  },
  custom: {
    themeFile: 'theme-custom.js',
    lessVariablesName: 'styles/variables-custom',
    globalVariables: {
      menuTheme: 'light',
      skylineThemeName: 'custom',
    },
  },
};

const getThemeConfig = () => {
  // parse config yaml
  const themeName = getConfig('theme') || 'default';

  const themeInfo = THEMES[themeName] || THEMES.default;

  const themeFile = configRoot(themeInfo.themeFile);

  // eslint-disable-next-line no-console
  console.log('themeFile', themeFile);

  if (fs.existsSync(themeFile)) {
    // eslint-disable-next-line import/no-dynamic-require
    const config = require(themeFile);
    return config;
  }

  // eslint-disable-next-line no-console
  console.error('the theme file not exist');
  return {};
};

const getCustomStyleVariables = () => {
  const themeName = getConfig('theme') || 'default';
  const themeInfo = THEMES[themeName] || THEMES.default;
  const lessFileName = themeInfo.lessVariablesName;
  const defaultLessFile = THEMES.default.lessVariablesName;

  if (defaultLessFile === lessFileName) {
    return false;
  }

  const customFile = srcRoot(`${lessFileName}.less`);
  // eslint-disable-next-line no-console
  console.log('customFile', customFile);
  const exist = fs.existsSync(customFile) && lessFileName;
  // eslint-disable-next-line no-console
  console.log('exist', exist);
  return exist;
};

const getGlobalVariablesForTheme = () => {
  const themeName = getConfig('theme') || 'default';
  const themeInfo = THEMES[themeName] || THEMES.default;
  return themeInfo.globalVariables || {};
};

const getGlobalVariables = () => {
  const variables = getObjectConfig('globalVariables') || {};
  const themeVariables = getGlobalVariablesForTheme();
  const allVariables = { ...variables, ...themeVariables };
  // eslint-disable-next-line no-console
  console.log('globalVariables', allVariables, JSON.stringify(allVariables));
  return JSON.stringify(allVariables);
};

const getCosApiTokenCredentials = () => {
  const username = JSON.stringify(getConfig('cosApiTokenUsername'));
  const password = JSON.stringify(getConfig('cosApiTokenPassword'));
  return {
    username,
    password,
  };
};

module.exports = {
  getServerConfig,
  root,
  getGlobalVariables,
  getThemeConfig,
  getCustomStyleVariables,
  getCosApiTokenCredentials,
};
