const path = require("path");
const nodeExternals = require('webpack-node-externals');


module.exports = (env, arg) => {
  return ({
    context: path.resolve(__dirname, './src'),
    entry: {
      server: './server/server.js'
    },
    output: {
      clean: true,
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      filename: '[name].js',
    },
    externalsPresets: {
      node: true
    },
    externals: [nodeExternals()],
    node: {
      __dirname: false,
      __filename: false
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            }
          }
        },
      ]
    }
  })
}