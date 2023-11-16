const { getOptions } = require('loader-utils');

module.exports = function (source) {
  const { search, change } = getOptions(this) || {}; // getOptions用于获取配置
  if (!search || !change) {
    return source;
  }
  if (source.includes(search)) {
    // eslint-disable-next-line no-console
    console.log(
      'has-search',
      search,
      'in',
      this.resource,
      'replace to',
      change
    );
  }
  return source.replace(search, change);
};
