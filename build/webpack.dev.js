const path = require('path');
const webpackBase = require('./webpack.base');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(webpackBase, {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'vue-style-loader',
					'css-loader'
				]
			},
			{
				test: /\.less$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'less-loader'
				]
			},
		]
	},
	devServer: {
		proxy: {
			// '/captcha': {
			// 	target: 'https://ebank.eximbank.gov.cn/eweb/GenTokenImg.do', 
			// 	changeOrigin: true, 
			// 	pathRewrite: {
			// 		'^/captcha': ''
			// 	}
			// }
			'/captcha': 'http://127.0.0.1:3000',
			'/sample': 'http://127.0.0.1:3000',
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, './template/index.html')
		})
	]
});