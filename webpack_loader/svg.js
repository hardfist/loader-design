const { transform } = require('@svgr/core');
const util = require('util');
module.exports = function svgLoader(content, map, meta) {
  const callback = this.async();
  util.callbackify(transform)(content.toString(), (err, data) => {
    callback(err, data);
  });
};
