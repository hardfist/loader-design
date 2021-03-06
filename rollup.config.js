const { defineConfig } = require('rollup');
const fs = require('fs');
const qs = require('qs');
const esbuild = require('esbuild');
const postcss = require('postcss');
const postcss_variable = require('postcss-custom-properties');
const postcss_module = require('postcss-modules');
const { transform } = require('@svgr/core');
const utils = require('@rollup/pluginutils');
const less = require('less');
const path = require('path');
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
  treeshake: 'smallest',
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
      name: 'less',
      async resolveId(id, importer) {
        if (id.endsWith('.less')) {
          const { id: resolvedId } = await this.resolve(id, importer, { skipSelf: true });
          return {
            id: appendQuery(resolvedId, { loader: 'css' }),
          };
        }
      },
      async transform(code, id) {
        const { filePath } = parseRequest(id);
        if (filePath.endsWith('.less')) {
          const result = await less.render(code);
          console.log('result:', result);
          return {
            code: result.css,
          };
        }
      },
    },
    {
      name: 'css',
      async transform(code, id) {
        const loader = defaultLoader(id);
        const { filePath } = parseRequest(id);
        let json;
        if (loader === 'css') {
          // todo support css bundle
          const result = await postcss([
            require('postcss-modules')({
              getJSON(_, _json) {
                json = _json;
              },
            }),
          ]).process(code, {
            from: filePath,
          });

          const jsonCode = utils.dataToEsm(json, {
            compact: true,
            namedExports: true,
            preferConst: true,
            objectShorthand: false,
          });
          console.log('json:', json, jsonCode);
          return {
            code: jsonCode,
          };
        }
      },
    },
  ],
});
