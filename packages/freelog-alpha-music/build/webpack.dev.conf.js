

const merge = require('webpack-merge')
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")

const baseConfig = require('./webpack.base.conf')

module.exports = merge(baseConfig, {

  entry: {
    // [tmpName]: path.resolve(__dirname, '../node_modules/@freelog/freelog-common-lib/', commonLibPkgJson.main)
  },

  output: {
    publicPath: '/',
  },

  mode: 'development',

  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    compress: true,
    disableHostCheck: true,
    // 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html。
    historyApiFallback: true,
    hot: false,
    host: '0.0.0.0',
    inline: false,
    port: 9888,
  },

  devtool: 'cheap-eval-source-map',

  module: {
    rules: [
      {
        test: /\.(less|css)$/,
        use: [
          'style-loader',
          'vue-style-loader',
          'css-loader',
          'less-loader',
        ]
      },
    ]
  },

  plugins: [
  ],
})


