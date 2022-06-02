const { Transformer } = require('@parcel/plugin');
const compiler = require('@vue/compiler-sfc');
const semver = require('semver');
const { hashObject } = require('@parcel/utils');
const path = require('path');
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
    const ast = (await asset.getAST()).program;
    console.log('ast:', ast);
    const { template, script, style, customBlocks } = ast;
    const code = await asset.getCode();
    let basePath = path.basename(asset.filePath);
    console.log('pipeline:', asset.pipeline);

    if (asset.pipeline) {
      // script:xxx.vue, template:xxx.vue, style:xxx.vue, custom:xxx.vue goes here
      switch (asset.pipeline) {
        case 'script':
          console.log('xxx:', script);
          const lang = script.lang;
          // pass script to 'ts'|'js'|'jsx'|'tsx' handler
          return [
            {
              type: lang || 'js',
              content: script.content,
            },
          ];
        case 'style':
          return [
            {
              type: style.lang || 'css',
              content: style.content,
            },
          ];
        case 'template':
          const template_code = compiler.compileTemplate({
            filename: asset.filePath,
            source: template.content,
            isProd: false,
            isFunctional: false,
          });
          return [
            {
              type: 'js',
              content: template_code,
            },
          ];
      }
    } else {
      // xxx.vue goes here
      return [
        {
          type: 'js',
          content: `
        require('script:./${basePath}');
        require('template:./${basePath}');
        require('style:./${basePath}');
        require('custom:./${basePath}');
        `,
        },
      ];
    }
  },
});
