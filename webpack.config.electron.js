var path = require('path')
var webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const package = require('./package.json')

const GLOBALS = {
	"process.env.NODE_ENV": JSON.stringify("production"),
	__DEV__: false,
	isElectron: true,
	TRANSLATE_ENABLED: false,
	MULTI_LANGUAGE: false,
	Type: 1
};

var chunksort = ["runtime", 'vendor', "antd", "bundle", 'echarts', 'google_protobuf'];

module.exports = {
	devtool: 'source-map',
	entry: {
		vendor: ['react', 'react-dom', "redux", "react-redux", "react-router-redux", "draft-js-export-html"],
		antd: ["antd"],
		bundle: ['./src/index'],
		echarts: ["echarts", "moment"],
		google_protobuf: ["google-protobuf", "draft-js"]
	},
	target: "web",
	output: {
		path: path.resolve(__dirname, "dist/js"),
		publicPath: "./js/",
		filename: '[name].js',
		chunkFilename: '[name].bundle.js',
	},
	plugins: [
		new CleanWebpackPlugin(['dist']),
		new webpack.DefinePlugin(GLOBALS),
		//new ExtractTextPlugin({
		//	filename: '[name].css'
		//}),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
			options: {
				noInfo: false,
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			comments: false,
			compress: {
				warnings: false
			}
		}),
		new webpack.optimize.CommonsChunkPlugin({
			names: ["echarts", "google_protobuf", "antd", "vendor"]
		}),
		new webpack.optimize.CommonsChunkPlugin({
			name: "runtime"
		}),
		new HtmlWebpackPlugin({
			title: package.title,
			template: "./template.html",
			filename: "../index.html",
			favicon: './favicon.ico',
			chunksSortMode: function(a, b) {
				var aIndex = chunksort.indexOf(a.names[0]);
				var bIndex = chunksort.indexOf(b.names[0]);
				aIndex = aIndex < 0 ? chunksort.length + 1 : aIndex;
				bIndex = bIndex < 0 ? chunksort.length + 1 : bIndex;
				return aIndex - bIndex;
			},
			electronRender: '<script type="text/javascript" src="./renderer.js"></script>'
		})
	],
	// alias是配置全局的路径入口名称，只要涉及到下面配置的文件路径，可以直接用定义的单个字母表示整个路径
	resolve: {
		extensions: ['.js', '.jsx', '.less', '.scss', '.css', "ico"],
		modules: [
			path.resolve(__dirname, 'node_modules'),
			path.join(__dirname, './src')
		],
		alias: {
			"actions": path.resolve(__dirname, "src/actions"),
			"components": path.resolve(__dirname, "src/components"),
			"apps": path.resolve(__dirname, "src/apps"),
			"reducers": path.resolve(__dirname, "src/reducers"),
			"utils": path.resolve(__dirname, "src/utils"),
			"im": path.resolve(__dirname, "src/im"),
			"lib": path.resolve(__dirname, "src/lib"),
			"core": path.resolve(__dirname, "src/core"),
			"locale": path.resolve(__dirname, "src/locale"),
			"public": path.resolve(__dirname, "src/public"),
			"store": path.resolve(__dirname, "src/store")
			// 'react': isPro ? 'preact-compat/dist/preact-compat' : 'react', //如果你不想要preact，可以删除这一行
			//'react-dom': isPro ? 'preact-compat/dist/preact-compat' : 'react-dom', //如果你不想要preact，可以删除这一行
			// 'create-react-class': 'preact-compat/lib/create-react-class' //如果你不想要preact，可以删除这一行
		}
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: 'babel-loader'
			},
			/*{
				test: /\.(css|scss)$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ["css-loader", "sass-loader"]
				})
				
			},
			{
				test: /\.(less)$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: ["css-loader", "less-loader"]
				})
				
			},*/
			{
				test: /\.(svg|eot|ttf|woff|woff2)$/,
				use: ['file-loader?limit=5000&name=fonts/[name].[ext]']
			},
			{
				test: /\.(css|scss)$/,
				use: ["style-loader", "css-loader", "sass-loader"]
			},
			{
				test: /\.(less)$/,
				use: ["style-loader", "css-loader",
					{
						loader: "less-loader",
						options: {
							modifyVars: {
								'@icon-url': '"../../../../../src/public/font/font_zck90zmlh7hf47vi"'
							}
						}
					}]
			},
			{
				test: /\.(jpe?g|png|gif|mp3|mp4|ico)$/i,
				use: ['file-loader?name=[name].[ext]'],
				exclude: [
					path.join(__dirname, "src/public/images/emoji"),
					path.join(__dirname, "src/public/images/skin"),
					path.join(__dirname, "src/public/images/webviewtype"),
				]
			},
			{
				test: /\.(png)$/i,
				include: path.join(__dirname, "src/public/images/emoji"),
				use: ["file-loader?name=emoji/[name].[ext]"]
			},
			{
				test: /\.(png)$/i,
				include: path.join(__dirname, "src/public/images/skin"),
				use: ["file-loader?name=skin/[name].[ext]"],
				exclude: path.join(__dirname, "src/public/images/skin/thumbnails")
			},
			{
				test: /\.(png)$/i,
				include: path.join(__dirname, "src/public/images/skin/thumbnails"),
				use: ["file-loader?name=skin/thumbnails/[name].[ext]"]
			},
			{
				test: /\.(png)$/i,
				include: path.join(__dirname, "src/public/images/webviewtype"),
				use: ["file-loader?name=webview/[name].[ext]"]
			}
		]
	}
};
