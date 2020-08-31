const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const compiler = require('vue-template-compiler');


module.exports = merge(common, {
	devtool: 'inline-source-map',
	output: {
		// 把子应用打包成 umd 库格式
		library: `app-[name]`,
		libraryTarget: 'umd',
		jsonpFunction: `webpackJsonp_app`,
	},
	devServer: {
		hot: true,
		open: true,
		port: 8080,
		proxy: {
			'/v1': 'http://qi.testfreelog.com'
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new HtmlWebpackPlugin({
			template: './public/index.html',
			title: 'Production',
		}),
	],
});
