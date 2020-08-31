
const baseConfig = require('./webpack.prod.conf')
const merge = require('webpack-merge')

module.exports = merge(baseConfig, {
  mode: 'development',
  output: {
    publicPath: '//static.testfreelog.com/',
  },
})
