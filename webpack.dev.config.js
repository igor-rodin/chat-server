const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");


module.exports = {
  mode: 'development',
  target: 'web',
  context: path.resolve(__dirname, './src'),
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: `[name].js`,
    assetModuleFilename: `images/[name][ext]`
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ["@babel/plugin-transform-runtime"]
          }
        }
      },
      {
        test: /\.(s[ac]|c)ss/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath: "" }
          },
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.hbs$/i,
        use: 'handlebars-loader'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      title: 'Чат',
      template: './index.html',
      excludeChunks: ['server']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'src/images'), to: path.resolve(__dirname, 'dist/images') },
      ]
    })
  ]
};