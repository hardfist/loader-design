const fs = require('fs');
const { transform } = require('@svgr/core');
/**
 *
 * @param {string} url
 * @param {any} context
 * @param {Function} next
 * @returns
 */
async function load(url, context, next) {
  if (context.format === 'svgr') {
    let result = await next(
      url,
      {
        ...context,
        format: 'jsx',
      },
      next
    );
    console.log('result:', result);
    const jsxCode = await transform(result.source.toString(), {}, {});
    return {
      format: 'jsx',
      source: jsxCode,
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
  console.log({ context });
  if (id.endsWith('.svg')) {
    let url = new URL(id, context.parentURL).href;
    return {
      url,
      shortCircuit: true,
      format: 'svgr',
    };
  }
  return next(id, context, next);
}

module.exports = {
  load,
  resolve,
};
