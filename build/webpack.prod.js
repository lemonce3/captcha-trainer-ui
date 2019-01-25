const path = require('path');
const webpackBase = require('./webpack.base');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = merge(webpackBase, {
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'css-loader'
				],
			},
			// {
			// 	test: /\.less$/,
			// 	use: ExtractTextPlugin.extract([
			// 		'css-loader',
			// 		'less-loader'
			// 	]),
			// },
		]
	},
	plugins: [
		// new ExtractTextPlugin('style.css'),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './template/index.html'),
			minify: true,
			inlineSource: '.(js|css)$'
		}),
		new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin)
	]
});