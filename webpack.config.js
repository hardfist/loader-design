const path = require('path');
/**
 * @type {import('webpack').Configuration}
 */
const configuration = {
  mode: 'none',
  entry: {
    main: path.resolve(__dirname, './src/index.mjs'),
  },
  module: {
    rules: [
      {
        test: /\.svg/,
        use: [require.resolve('./webpack_loader/jsx'), require.resolve('./webpack_loader/svg.js')],
      },
      {
        test: /\.less/,
        use: ['css-loader', 'less-loader'],
      },
      {
        test: /\.css/,
        use: ['css-loader'],
      },
      {
        test: /\.vue/,
        use: [require.resolve('./webpack_loader/vue.js')],
      },
    ],
  },
};

module.exports = configuration;
