const fs = require('fs');
const esbuild = require('esbuild');
const { transform } = require('@svgr/core');
/**
 *
 * @param {string} url
 * @param {any} context
 * @param {Function} next
 * @returns
 */
async function load(url, context, next) {
  if (url.endsWith('.svg')) {
    let result = await next(
      url,
      {
        ...context,
        format: 'module',
      },
      next
    );
    const jsxCode = await transform(result.source.toString(), {}, {});
    const code = (
      await esbuild.transformSync(jsxCode, {
        loader: 'jsx',
      })
    ).code;
    return {
      format: 'module'
      source: code,
      shortCircuit: true,
    };
  } else {
    return next(url, context, next);
  }
}
/**
 *
 * @param {string} id
 * @param {*} context
 * @param {*} next
 */
async function resolve(id, context, next) {
  // handle unknown file extension problem
  if (id.endsWith('.svg')) {
    let url = new URL(id, context.parentURL).href;
    return {
      url,
      format: 'module',
      shortCircuit: true,
    };
  }
  return next(id, context, next);
}

module.exports = {
  load,
  resolve,
};
