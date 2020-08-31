const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const baseConfig = require('./webpack.base.conf')
const merge = require('webpack-merge')
const path = require('path')

const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
const staticDomain = argv.env === 'prod' ? '//static.freelog.com' :  '//static.testfreelog.com'

module.exports = merge(baseConfig, {
  mode: 'production',

  output: {
    crossOriginLoading: 'anonymous',
    publicPath: `${staticDomain}/pagebuild/`,
  },

  module: {
    rules: [
      {
        test: /\.(less|css)$/,
        use: [
          'style-loader',
          'vue-style-loader',
          // MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ]
      },
    ]
  },

  optimization: {
    concatenateModules: true,
    nodeEnv: 'production',
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin({})
    ],
  },

  plugins: [
    // new HtmlWebpackPlugin({
    //   preload: ['**/*.*'],
    //   inject: 'body',
    //   filename: 'index.html',
    //   template: path.resolve(__dirname, '../public/index.html'),
    //   // excludeChunks: [ tmpName ],
    // }),
  ],
})

