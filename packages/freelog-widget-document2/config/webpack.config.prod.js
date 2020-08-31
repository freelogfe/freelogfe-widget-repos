module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|eot|woff|ttf)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 81920,
              name: 'public/assets/[name].[ext]'
            }
          }
        ]
      }
    ]
  },
}