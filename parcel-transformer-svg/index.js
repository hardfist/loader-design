const { Transformer } = require('@parcel/plugin');
const { transform } = require('@svgr/core');

module.exports = new Transformer({
  async transform({ asset }) {
    console.log(asset);
    const code = await asset.getCode();
    const jsx = await transform(code);
    asset.setCode(jsx);
    asset.type = 'js';
    return [asset];
  },
});
