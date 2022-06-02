const { Transformer } = require('@parcel/plugin');
const compiler = require('@vue/compiler-sfc');
const semver = require('semver');
const { hashObject } = require('@parcel/utils');
module.exports = new Transformer({
  canReuseAST({ ast }) {
    return ast.type === 'vue' && semver.satisfies(ast.version, '^3.0.0');
  },
  async parse({ asset }) {
    let code = await asset.getCode();
    let parsed = compiler.parse(code, {
      sourceMap: true,
      filename: asset.filePath,
    });
    let descriptor = parsed.descriptor;
    let id = hashObject({
      filePath: asset.filePath,
      source: code,
    }).slice(-6);
    return {
      type: 'vue',
      version: '3.0.0',
      program: {
        ...descriptor,
        script: compiler.compileScript(descriptor, {
          id,
          isProd: false,
        }),
      },
    };
  },
  async transform({ asset, options, resolve, config }) {
    console.log('pipeline:', asset.pipeline);
    const ast = (await asset.getAST()).program;
    const { template, script, styles, customBlocks } = ast;
    const code = await asset.getCode();
    console.log('code:', script.content);
    return [
      {
        type: 'js',
        content: script.content,
      },
    ];
  },
});
