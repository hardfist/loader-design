const esbuild = require('esbuild');
async function load(url, context, next) {
  if (context.format === 'jsx') {
    const code = await next(url, { ...context, format: 'module' }, next);
    const jsCode = esbuild.transformSync(code, { format: 'esm' });
    return {
      source: jsCode.code,
      format: 'module',
      short,
    };
  } else {
    return {
      source: code,
      format: context.format,
    };
  }
}

module.exports = {};
