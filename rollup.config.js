const { defineConfig } = require('rollup');
const fs = require('fs');
const qs = require('qs');
const esbuild = require('esbuild');
const postcss = require('postcss');
const postcss_module = require('postcss-css-variables');
const { transform } = require('@svgr/core');
const cssLang = /\.(less|sass|css|scss)$/;
/**
 *
 * @param {*} id
 * @returns
 */
function parseRequest(id) {
  let [filePath, query] = id.split('?');

  return {
    filePath /* string */,
    query: qs.parse(query),
  };
}
function appendQuery(id, newQuery) {
  let { filePath, query } = parseRequest(id);
  query = { ...query, ...newQuery };
  return filePath + '?' + qs.stringify(query);
}
function defaultLoader(id) {
  const { filePath, query } = parseRequest(id);
  // guess loader from load query
  if (query['loader']) {
    return query['loader'];
  }
  if (filePath.endsWith('.jsx')) {
    return 'jsx';
  } else if (cssLang.test(filePath)) {
    return filePath.match(cssLang)[1];
  } else {
    return 'js';
  }
}
module.exports = defineConfig({
  input: {
    main: './src/index.mjs',
  },
  output: {
    dir: 'dist',
  },
  plugins: [
    {
      name: 'svg',
      async resolveId(id, importer) {
        // convert .svg to .svg&lang.jsx so jsx plugin can handle this
        if (id.endsWith('.svg')) {
          const { id: resolvedId } = await this.resolve(id, importer, { skipSelf: true });
          return {
            id: appendQuery(resolvedId, { loader: 'jsx' }),
          };
        } else {
          return;
        }
      },
      async transform(code, id) {
        const { filePath, query } = parseRequest(id);
        if (filePath.endsWith('.svg')) {
          const jsxCode = await transform(code);
          return {
            code: jsxCode,
          };
        } else {
          return undefined;
        }
      },
      async load(id) {
        const { filePath, query } = parseRequest(id);
        console.log('xxx:', filePath, query);
        return {
          code: fs.readFileSync(filePath, 'utf-8'),
        };
      },
    },
    {
      name: 'jsx',
      async transform(code, id) {
        const loader = defaultLoader(id);
        if (loader === 'jsx') {
          const jsCode = esbuild.transformSync(code, { loader: 'jsx' }).code;
          return {
            code: jsCode,
          };
        }
      },
    },
    {
      name: 'css',
      async transform(code, id) {
        const loader = defaultLoader(id);
        if (loader === 'css') {
          // todo support css bundle
          return {
            code: 'export default {}',
          };
        }
      },
    },
  ],
});
