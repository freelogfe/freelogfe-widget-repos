var webpack = require('webpack')
var merge = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')

const baseConfig = require('./webpack.base.conf')

module.exports = merge(baseConfig, {
  mode: 'production',
  devtool: '#source-map',
  performance: {
    hints: false
  },
  optimization: {
    concatenateModules: true,
    nodeEnv: 'production',
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin(),
    ],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]
})
