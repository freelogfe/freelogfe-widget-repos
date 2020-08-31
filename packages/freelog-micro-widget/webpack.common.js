const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    entry: {
        // app: './src/index.js',
        app: './src/index.js',
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.css$/,
                use: [
                    'raw-loader',
                    'style-loader',
                    'vue-style-loader',
                ],
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'vue-style-loader',
                    {
                        loader: 'raw-loader',
                    },
                    {
                        loader: "less-loader",
                    },
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: true,
                        },
                    },
                ],
            },
        ],
    },
};
