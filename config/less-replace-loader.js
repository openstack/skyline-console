const { getOptions } = require('loader-utils');

module.exports = function (source) {
  const { variableFile } = getOptions(this) || {}; // getOptions用于获取配置
  if (!variableFile) {
    return source;
  }

  // 将 @import "styles/variables"; 变更为 @import "styles/variables";
  const consoleReg = /~styles\/variables/g;
  if (consoleReg.test(source)) {
    // eslint-disable-next-line no-console
    console.log(this.resourcePath, 'match ~styles/variables');
    return source.replace(consoleReg, `~${variableFile}`);
  }
  return source;
};
