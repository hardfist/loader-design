const compiler = require('@vue/compiler-sfc');
const loader_utils = require('loader-utils');
const qs = require('qs');
const { hashObject } = require('@parcel/utils');
const descCache = new Map();
const util = require('util');

/**
 * @this {import('webpack').LoaderContext<any>}
 */
module.exports = function vueLoader(content) {
  const callback = this.async();
  const inner = async () => {
    const parsed = compiler.parse(content, {
      sourceMap: false,
      filename: this.resourcePath,
    });
    const descriptor = parsed.descriptor;
    const { script, scriptSetup, styles, template, customBlocks } = descriptor;
    descCache.set(this.resource, {
      ...parsed.descriptor,
      script: compiler.compileScript(descriptor, {
        id: Math.random().toString(),
        isProd: false,
      }),
    });
    const query = qs.parse(this.resourceQuery, { ignoreQueryPrefix: true });
    if (query.vue === 'true') {
      let cache = descCache.get(this.resource);
      const { script, style } = cache;
      if (query.type === 'script') {
        return script.content;
      } else if (query.type === 'style') {
        const lang = styles[0].lang;
        return styles[0].content;
      }
    } else {
      const jsPath = this.resourcePath + '.js' + '!=!' + this.resourcePath + '?vue=true&type=script';
      // const jscode = await util.promisify(this.loadModule)(jsPath);
      const cssPath = this.resourcePath + '.less' + '!=!' + this.resourcePath + '?vue=true&type=style';
      // const csscode = await util.promisify(this.loadModule)(cssPath);
      // console.log('csscode:', csscode);
      return `require(${JSON.stringify(jsPath)});require(${JSON.stringify(cssPath)})`;
    }
  };
  return util.callbackify(inner)((err, data) => {
    callback(err, data);
  });
};
