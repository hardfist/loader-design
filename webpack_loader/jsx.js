const { transformSync } = require('esbuild');
const util = require('util');
module.exports = function svgLoader(content, map, meta) {
  const jsCode = transformSync(content.toString(), {
    loader: 'jsx',
  });
  return jsCode.code;
};
