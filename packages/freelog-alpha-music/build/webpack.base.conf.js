
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const path = require('path')
const srcDir = path.resolve(__dirname, '../src')
const pkg = require(path.join(__dirname, '../package.json'))
const config = require('../config')

module.exports = {
  entry: {
    app: path.resolve(__dirname, '../src/app/index.js')
  },
  output: {
    path: config.build.assetsRoot,
    filename: `${pkg.name}.js`
  },

  node: {
    'fs': 'empty'
  },

  resolve: {
    extensions: [ '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
  },

  module: {
    rules: [
      /* config.module.rule('html') */
      {
        test: /\.html$/,
        use: [ {
          loader: 'html-loader',
          options: {
            minimize: true,
            collapseWhitespace: false
          }
        }],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      {
        test: /\.jsx?$/,
        // exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
        },{
          loader: 'source-map-loader',
        }]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@kazupon/vue-i18n-loader'
      },
      {
        test: /\.(png|jpg|gif|eot|woff|ttf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 153600,
              name: 'public/assets/[name].[ext]'
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new VueLoaderPlugin(),
  ],
}
