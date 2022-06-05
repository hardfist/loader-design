const compiler = require('@vue/compiler-sfc');
/**
 * @this {import('webpack').LoaderContext<any>}
 */
function vueLoader(content, map, meta) {
  this.resour;
  const parsed = compiler.parse(content, {
    sourceMap: false,
  });
}

module.exports = vueLoader;
